import { HWProvider } from '@multiversx/sdk-hw-provider/out';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import { setLedgerAccount } from 'store/actions';
import { setLedgerLogin } from 'store/actions/loginInfo/loginInfoActions';
import { ProviderErrorsEnum } from 'types';
import { LedgerConnectEventsEnum } from '../types';
import { getAuthTokenText } from './getAuthTokenText';
import { updateLedgerAccounts } from './updateLedgerAccounts';
import {
  LedgerConfigType,
  LedgerStateManagerType,
  LedgerEventBusType,
  LedgerLoginType
} from '../types/ledgerProvider.types';

type GetLedgerLoginProps = {
  options?: {
    callbackUrl?: string;
    token?: string;
  };
  config: LedgerConfigType;
  manager: LedgerStateManagerType | null;
  provider: HWProvider | null;
  eventBus?: LedgerEventBusType | null;
  login: LedgerLoginType | null;
};

export const authenticateLedgerAccount = async ({
  options,
  config,
  manager,
  provider,
  eventBus,
  login
}: GetLedgerLoginProps) => {
  const authData = getAuthTokenText({
    loginToken: options?.token,
    version: config.version
  });

  await updateLedgerAccounts({ manager, provider });

  const selectedAccount = await new Promise<{
    address: string;
    signature: string;
    addressIndex: number;
  }>(async (resolve, reject) => {
    const closeComponent = () => {
      manager?.closeAndReset();
    };

    const onNextPageChanged = async () => {
      const startIndex = manager?.getAccountScreenData()?.startIndex || 0;
      manager?.updateStartIndex(startIndex + manager.addressesPerPage);
      await updateLedgerAccounts({ manager, provider });
    };

    const onPrevPageChanged = async () => {
      const startIndex = manager?.getAccountScreenData()?.startIndex || 0;

      if (startIndex > 0) {
        manager?.updateStartIndex(
          Math.max(0, startIndex - manager.addressesPerPage)
        );

        await updateLedgerAccounts({ manager, provider });
      }
    };

    const onAccessWallet = async (payload: {
      addressIndex: number;
      selectedAddress: string;
    }) => {
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
          await updateLedgerAccounts({ manager, provider });
        }
      }
    };

    const unsubscribeFromEvents = () => {
      if (!eventBus) {
        throw new Error(ProviderErrorsEnum.eventBusError);
      }
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      eventBus.unsubscribe(LedgerConnectEventsEnum.CLOSE, onCancel);
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
    };

    const onCancel = async () => {
      await updateLedgerAccounts({ manager, provider });
      unsubscribeFromEvents();
      reject('User cancelled login');
    };

    if (!eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    eventBus.subscribe(LedgerConnectEventsEnum.CLOSE, onCancel);
    eventBus.subscribe(LedgerConnectEventsEnum.NEXT_PAGE, onNextPageChanged);
    eventBus.subscribe(LedgerConnectEventsEnum.PREV_PAGE, onPrevPageChanged);
    eventBus.subscribe(LedgerConnectEventsEnum.ACCESS_WALLET, onAccessWallet);
  });

  const { version, dataEnabled } = config;

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
};
