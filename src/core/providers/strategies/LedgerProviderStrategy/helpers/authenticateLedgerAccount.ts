import { HWProvider } from '@multiversx/sdk-hw-provider/out';
import { LedgerConnectStateManager } from 'core/managers/internal/LedgerConnectStateManager/LedgerConnectStateManager';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import { IEventBus, LedgerConnectEventsEnum } from 'lib/sdkDappCoreUi';
import { setLedgerAccount } from 'store/actions';
import { setLedgerLogin } from 'store/actions/loginInfo/loginInfoActions';
import { ProviderErrorsEnum } from 'types';
import { getAuthTokenText } from './getAuthTokenText';
import { updateAccountsList } from './updateAccountsList';
import {
  LedgerConfigType,
  LedgerLoginType
} from '../types/ledgerProvider.types';

type GetLedgerLoginType = {
  options?: {
    callbackUrl?: string;
    token?: string;
  };
  config: LedgerConfigType;
  manager: LedgerConnectStateManager | null;
  provider: HWProvider | null;
  eventBus?: IEventBus | null;
  login: LedgerLoginType | null;
};

export function authenticateLedgerAccount({
  options,
  config,
  manager,
  provider,
  eventBus,
  login
}: GetLedgerLoginType) {
  const authData = getAuthTokenText({
    loginToken: options?.token,
    version: config.version
  });

  // refresh account list
  return updateAccountsList({ manager, provider }).then(async function () {
    // cycle trough accounts until user makes a choice
    const selectedAccount = await new Promise<{
      address: string;
      signature: string;
      addressIndex: number;
    }>(async function (resolve, reject) {
      function closeComponent() {
        manager?.closeAndReset();
      }

      async function onNextPageChanged() {
        const startIndex = manager?.getAccountScreenData()?.startIndex || 0;
        manager?.updateStartIndex(startIndex + manager.addressesPerPage);
        await updateAccountsList({ manager, provider });
      }

      async function onPrevPageChanged() {
        const startIndex = manager?.getAccountScreenData()?.startIndex || 0;

        if (startIndex > 0) {
          manager?.updateStartIndex(
            Math.max(0, startIndex - manager.addressesPerPage)
          );

          await updateAccountsList({ manager, provider });
        }
      }

      async function onAccessWallet(payload: {
        addressIndex: number;
        selectedAddress: string;
      }) {
        if (!provider || !login) {
          return;
        }

        manager?.updateConfirmScreen({
          ...authData,
          selectedAddress: payload.selectedAddress
        });

        try {
          const loginInfo = options?.token
            ? await provider.tokenLogin({
                token: Buffer.from(`${options?.token}{}`),
                addressIndex: payload.addressIndex
              })
            : await login({
                addressIndex: payload.addressIndex
              });

          closeComponent();

          resolve({
            address: loginInfo.address,
            signature: loginInfo.signature
              ? loginInfo.signature.toString('hex')
              : '',
            addressIndex: payload.addressIndex
          });
        } catch (err) {
          console.error('User rejected login:', err);
          const shouldClose = Boolean(manager?.getAccountScreenData());
          if (shouldClose) {
            return closeComponent();
          }
          const shouldGoBack = Boolean(manager?.getConfirmScreenData());
          if (shouldGoBack) {
            await updateAccountsList({ manager, provider });
          }
        }
      }

      function unsubscribeFromEvents() {
        if (!eventBus) {
          throw new Error(ProviderErrorsEnum.eventBusError);
        }

        eventBus.unsubscribe(
          LedgerConnectEventsEnum.CLOSE_LEDGER_CONNECT_PANEL,
          onCancel
        );
        eventBus.unsubscribe(
          LedgerConnectEventsEnum.NEXT_PAGE,
          onNextPageChanged
        );
        eventBus.unsubscribe(
          LedgerConnectEventsEnum.PREV_PAGE,
          onPrevPageChanged
        );
        eventBus.unsubscribe(
          LedgerConnectEventsEnum.ACCESS_WALLET,
          onAccessWallet
        );
      }

      async function onCancel() {
        await updateAccountsList({ manager, provider });
        unsubscribeFromEvents();
        reject('User cancelled login');
      }

      if (!eventBus) {
        throw new Error(ProviderErrorsEnum.eventBusError);
      }

      eventBus.subscribe(
        LedgerConnectEventsEnum.CLOSE_LEDGER_CONNECT_PANEL,
        onCancel
      );
      eventBus.subscribe(LedgerConnectEventsEnum.NEXT_PAGE, onNextPageChanged);
      eventBus.subscribe(LedgerConnectEventsEnum.PREV_PAGE, onPrevPageChanged);
      eventBus.subscribe(LedgerConnectEventsEnum.ACCESS_WALLET, onAccessWallet);
    });

    const { version, dataEnabled } = config;

    // login is finished, data can be persisted in the store
    setLedgerLogin({
      index: selectedAccount.addressIndex,
      loginType: ProviderTypeEnum.ledger
    });

    setLedgerAccount({
      address: selectedAccount.address,
      index: selectedAccount.addressIndex,
      version,
      hasContractDataEnabled: dataEnabled
    });

    return {
      address: selectedAccount.address,
      signature: selectedAccount.signature
    };
  });
}
