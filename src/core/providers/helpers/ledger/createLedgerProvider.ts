import type { LedgerConnectModal } from '@multiversx/sdk-dapp-core-ui/dist/components/ledger-connect-modal';
import { defineCustomElements } from '@multiversx/sdk-dapp-core-ui/loader';
import BigNumber from 'bignumber.js';
import { safeWindow } from 'constants/index';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import {
  IEventBus,
  IProvider,
  ProviderTypeEnum
} from 'core/providers/types/providerFactory.types';
import { setLedgerAccount } from 'store/actions/account/accountActions';
import { setLedgerLogin } from 'store/actions/loginInfo/loginInfoActions';
import { fetchAccount } from 'utils/account/fetchAccount';
import { getAuthTokenText } from './helpers/getAuthTokenText';
import { getLedgerErrorCodes } from './helpers/getLedgerErrorCodes';
import { getLedgerProvider } from './helpers/getLedgerProvider';
import { LedgerConnectStateManager } from './helpers/LedgerConnectStateManager';
import { LedgerConnectEventsEnum } from './ledger.types';
import { ILedgerAccount } from './ledger.types';

const failInitializeErrorText = 'Check if the MultiversX App is open on Ledger';

// TODO: remove
export async function createLedgerProvider(): Promise<IProvider | null> {
  const shouldInitiateLogin = !getIsLoggedIn();

  let eventBus: IEventBus | undefined;
  if (shouldInitiateLogin) {
    defineCustomElements(safeWindow);
    const ledgerModalElement = document.createElement(
      'ledger-connect-modal'
    ) as LedgerConnectModal;
    document.body.appendChild(ledgerModalElement);
    eventBus = await ledgerModalElement.getEventBus();
  }

  if (!eventBus) {
    throw new Error('Event bus not provided for Ledger provider');
  }

  const manager = LedgerConnectStateManager.getInstance(eventBus);

  const { ledgerProvider: provider, ledgerConfig } = await new Promise<
    Awaited<ReturnType<typeof getLedgerProvider>>
  >(async function buildLedgerProvider(resolve, reject) {
    const onRetry = () => buildLedgerProvider(resolve, reject);
    const onCancel = () => reject('Device unavailable');

    try {
      manager.updateAccountScreen({
        isLoading: true
      });

      const data = await getLedgerProvider();

      eventBus.unsubscribe(LedgerConnectEventsEnum.CONNECT_DEVICE, onRetry);
      eventBus.unsubscribe(LedgerConnectEventsEnum.CLOSE, onCancel);
      resolve(data);
    } catch (err) {
      if (!shouldInitiateLogin) {
        throw err;
      }

      const { errorMessage, defaultErrorMessage } = getLedgerErrorCodes(err);
      manager.updateConnectScreen({
        error: errorMessage ?? defaultErrorMessage ?? failInitializeErrorText
      });

      eventBus.subscribe(LedgerConnectEventsEnum.CONNECT_DEVICE, onRetry);
      eventBus.subscribe(LedgerConnectEventsEnum.CLOSE, onCancel);
    }
  });

  const createdProvider = provider as unknown as IProvider;

  const hwProviderLogin = provider.login;

  createdProvider.login = async (options?: {
    token?: string;
  }): Promise<{
    address: string;
    signature: string;
  }> => {
    const isConnected = provider.isConnected();

    if (!isConnected) {
      throw new Error('Ledger device is not connected');
    }

    const authData = getAuthTokenText({
      loginToken: options?.token,
      version: ledgerConfig.version
    });

    const updateAccounts = async () => {
      const startIndex = manager.getAccountScreenData()?.startIndex || 0;
      const allAccounts = manager.getAllAccounts();

      const hasData = allAccounts.some(
        ({ index, balance }) =>
          index === startIndex && new BigNumber(balance).isFinite()
      );

      const slicedAccounts = allAccounts.slice(
        startIndex,
        startIndex + manager.addressesPerPage
      );

      if (hasData) {
        return manager.updateAccountScreen({
          accounts: slicedAccounts,
          isLoading: false
        });
      }

      if (slicedAccounts.length === 0) {
        manager.updateAccountScreen({
          isLoading: true
        });
      }

      try {
        const accountsArray = await provider.getAccounts(
          startIndex,
          manager.addressesPerPage
        );

        const accountsWithBalance: ILedgerAccount[] = accountsArray.map(
          (address, index) => {
            return {
              address,
              balance: '...',
              index: index + startIndex
            };
          }
        );

        const newAllAccounts = [...allAccounts, ...accountsWithBalance];

        manager.updateAllAccounts(newAllAccounts);

        manager.updateAccountScreen({
          accounts: newAllAccounts.slice(
            startIndex,
            startIndex + manager.addressesPerPage
          ),
          isLoading: false
        });

        const balancePromises = accountsArray.map((address) =>
          fetchAccount(address)
        );

        const balances = await Promise.all(balancePromises);

        balances.forEach((account, index) => {
          const bNbalance = new BigNumber(String(account?.balance));
          if (!account || bNbalance.isNaN()) {
            return;
          }
          const balance = bNbalance
            .dividedBy(BigNumber(10).pow(18))
            .toFormat(4)
            .toString();
          const accountArrayIndex = index + startIndex;
          newAllAccounts[accountArrayIndex].balance = balance;
        });

        manager.updateAllAccounts(newAllAccounts);

        manager.updateAccountScreen({
          accounts: newAllAccounts.slice(
            startIndex,
            startIndex + manager.addressesPerPage
          )
        });
      } catch (error) {
        manager.updateAccountScreen({
          accounts: allAccounts.slice(
            startIndex,
            startIndex + manager.addressesPerPage
          ),
          isLoading: false
        });
        console.error('Failed to fetch accounts:', error);
      }
    };

    await updateAccounts();

    const selectedAccount = await new Promise<{
      address: string;
      signature: string;
      addressIndex: number;
    }>(async (resolve, reject) => {
      const unsubscribeFromEvents = () => {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        eventBus.unsubscribe(LedgerConnectEventsEnum.CLOSE, onCancel);
        eventBus.unsubscribe(
          LedgerConnectEventsEnum.NEXT_PAGE,
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          onNextPageChanged
        );
        eventBus.unsubscribe(
          LedgerConnectEventsEnum.PREV_PAGE,
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          onPrevPageChanged
        );
        eventBus.unsubscribe(
          LedgerConnectEventsEnum.ACCESS_WALLET,
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          onAccessWallet
        );
      };

      const closeComponent = () => {
        manager.closeAndReset();
      };

      const onCancel = async () => {
        await updateAccounts();
        unsubscribeFromEvents();
        reject('User cancelled login');
      };

      const onNextPageChanged = async () => {
        const startIndex = manager.getAccountScreenData()?.startIndex || 0;
        manager.updateStartIndex(startIndex + manager.addressesPerPage);
        await updateAccounts();
      };

      const onPrevPageChanged = async () => {
        const startIndex = manager.getAccountScreenData()?.startIndex || 0;

        if (startIndex > 0) {
          manager.updateStartIndex(
            Math.max(0, startIndex - manager.addressesPerPage)
          );

          await updateAccounts();
        }
      };

      const onAccessWallet = async function tryAccessWallet(payload: {
        addressIndex: number;
        selectedAddress: string;
      }) {
        manager.updateConfirmScreen({
          ...authData,
          selectedAddress: payload.selectedAddress
        });

        try {
          const loginInfo = options?.token
            ? await provider.tokenLogin({
                token: Buffer.from(`${options?.token}{}`),
                addressIndex: payload.addressIndex
              })
            : await hwProviderLogin({
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
          const shouldClose = Boolean(manager.getAccountScreenData());
          if (shouldClose) {
            return closeComponent();
          }
          const shouldGoBack = Boolean(manager.getConfirmScreenData());
          if (shouldGoBack) {
            await updateAccounts();
          }
        }
      };

      eventBus.subscribe(LedgerConnectEventsEnum.CLOSE, onCancel);
      eventBus.subscribe(LedgerConnectEventsEnum.NEXT_PAGE, onNextPageChanged);
      eventBus.subscribe(LedgerConnectEventsEnum.PREV_PAGE, onPrevPageChanged);
      eventBus.subscribe(LedgerConnectEventsEnum.ACCESS_WALLET, onAccessWallet);
    });

    const { version, dataEnabled } = ledgerConfig;

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

  // createdProvider.signTransaction = ...

  return createdProvider;
}
