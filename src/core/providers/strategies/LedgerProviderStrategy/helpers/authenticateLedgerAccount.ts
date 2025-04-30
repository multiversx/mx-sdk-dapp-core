import { HWProvider } from '@multiversx/sdk-hw-provider/out';
import { BigNumber } from 'bignumber.js';

import { ACCOUNTS_ENDPOINT } from 'apiCalls';
import { LedgerConnectStateManager } from 'core/managers/internal/LedgerConnectStateManager/LedgerConnectStateManager';
import { LedgerConnectEventsEnum } from 'core/managers/internal/LedgerConnectStateManager/types';
import { getExplorerAddress } from 'core/methods/network/getExplorerAddress';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import { IEventBus } from 'lib/sdkDappCoreUi';
import { setLedgerAccount } from 'store/actions';
import { setLedgerLogin } from 'store/actions/loginInfo/loginInfoActions';
import { ProviderErrorsEnum } from 'types';
import { getExplorerLink } from 'utils/transactions/getExplorerLink';

import { getAuthTokenText } from './getAuthTokenText';
import { updateAccountsList } from './updateAccountsList';
import {
  LedgerConfigType,
  LedgerLoginType
} from '../types/ledgerProvider.types';

interface IGetLedgerLogin {
  options?: {
    callbackUrl?: string;
    token?: string;
  };
  config: LedgerConfigType;
  manager: LedgerConnectStateManager | null;
  provider: HWProvider | null;
  eventBus?: IEventBus | null;
  login: LedgerLoginType | null;
}

interface ISelectedAccount {
  address: string;
  signature: string;
  addressIndex: number;
}

export async function authenticateLedgerAccount({
  options,
  config,
  manager,
  provider,
  eventBus,
  login
}: IGetLedgerLogin) {
  const explorerAddress = getExplorerAddress();

  const authData = getAuthTokenText({
    loginToken: options?.token,
    version: config.version
  });

  const accountsListProps = {
    manager,
    provider
  };

  // refresh account list
  await updateAccountsList(accountsListProps);

  // cycle trough accounts until user makes a choice
  const selectedAccount = await new Promise<ISelectedAccount>(async function (
    resolve,
    reject
  ) {
    function closeComponent() {
      manager?.closeAndReset();
    }

    async function handleGoToPage(page: number) {
      const addressesPerPage = manager ? manager.addressesPerPage ?? 1 : 1;
      const startIndex = new BigNumber(page - 1).times(addressesPerPage);

      manager?.updateStartIndex(Math.max(0, parseInt(startIndex.toString())));
      await updateAccountsList(accountsListProps);
    }

    async function handleAccessWallet(payload: {
      addressIndex: number;
      selectedAddress: string;
    }) {
      if (!provider || !login) {
        return;
      }

      manager?.updateConfirmScreen({
        ...authData,
        selectedAddress: payload.selectedAddress,
        addressExplorerLink: getExplorerLink({
          to: `/${ACCOUNTS_ENDPOINT}/${payload.selectedAddress}`,
          explorerAddress
        })
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
          await updateAccountsList(accountsListProps);
        }
      }
    }

    function unsubscribeFromEvents() {
      if (!eventBus) {
        throw new Error(ProviderErrorsEnum.eventBusError);
      }

      eventBus.unsubscribe(
        LedgerConnectEventsEnum.CLOSE_LEDGER_CONNECT_PANEL,
        handleCancel
      );

      eventBus.unsubscribe(
        LedgerConnectEventsEnum.ACCESS_WALLET,
        handleAccessWallet
      );
      eventBus.unsubscribe(LedgerConnectEventsEnum.GO_TO_PAGE, handleGoToPage);
    }

    async function handleCancel() {
      await updateAccountsList(accountsListProps);
      unsubscribeFromEvents();
      reject('User cancelled login');
    }

    if (!eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    eventBus.subscribe(
      LedgerConnectEventsEnum.CLOSE_LEDGER_CONNECT_PANEL,
      handleCancel
    );

    eventBus.subscribe(LedgerConnectEventsEnum.GO_TO_PAGE, handleGoToPage);
    eventBus.subscribe(
      LedgerConnectEventsEnum.ACCESS_WALLET,
      handleAccessWallet
    );
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
}
