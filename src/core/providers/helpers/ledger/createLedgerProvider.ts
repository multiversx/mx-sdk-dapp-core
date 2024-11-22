import {
  IProvider,
  ProviderTypeEnum
} from 'core/providers/types/providerFactory.types';
import { getLedgerProvider } from './getLedgerProvider';
import { setLedgerLogin } from 'store/actions/loginInfo/loginInfoActions';
import { setLedgerAccount } from 'store/actions/account/accountActions';
import { initiateLedgerLogin } from './components/initiateLedgerLogin';
import { EventBus } from './components/EventBus';
import { ILedgerAccount } from './ledger.types';
import { fetchAccount } from 'utils/account/fetchAccount';
import { getAuthTokenText } from './components/LedgerModalComponent/helpers/getAuthTokenText';
import BigNumber from 'bignumber.js';
import {
  IAccountScreenData,
  IConfirmScreenData,
  ILedgerModalData
} from './components/LedgerModalComponent/LedgerModalComponent';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { getLedgerErrorCodes } from './getLedgerErrorCodes';

const failInitializeErrorText = 'Check if the MultiversX App is open on Ledger';
const addressesPerPage = 10;
let allAccounts: ILedgerAccount[] = [];

let accountScreenData: IAccountScreenData = {
  accounts: allAccounts,
  startIndex: 0,
  addressesPerPage,
  isLoading: true
};

let confirmScreenData: IConfirmScreenData = {
  selectedAddress: ''
};

let data: ILedgerModalData = {
  accountScreenData: null,
  confirmScreenData: null,
  connectScreenData: {}
};

export async function createLedgerProvider(): Promise<IProvider | null> {
  const shouldInitiateLogin = !getIsLoggedIn();
  const eventBus = EventBus.getInstance();

  const { ledgerProvider: provider, ledgerConfig } = await new Promise<
    Awaited<ReturnType<typeof getLedgerProvider>>
  >(async function buildLedgerProvider(resolve, reject) {
    const onRetry = () => buildLedgerProvider(resolve, reject);
    const onCancel = () => reject('User cancelled login');

    if (shouldInitiateLogin) {
      initiateLedgerLogin();
    }

    try {
      const data = await getLedgerProvider();
      eventBus.unsubscribe('CONNECT_DEVICE', onRetry);
      eventBus.unsubscribe('CLOSE', onCancel);
      resolve(data);
    } catch (err) {
      if (!shouldInitiateLogin) {
        throw err;
      }

      const { errorMessage, defaultErrorMessage } = getLedgerErrorCodes(err);

      data.connectScreenData = {
        error: errorMessage ?? defaultErrorMessage ?? failInitializeErrorText
      };
      eventBus.publish('DATA_UPDATE', data);
      eventBus.subscribe('CONNECT_DEVICE', onRetry);
      eventBus.subscribe('CLOSE', onCancel);
      // if user rejected on ledger search for error and reject
    }
  });

  const createdProvider = provider as unknown as IProvider;

  const hwProviderLogin = provider.login;

  createdProvider.getType = () => ProviderTypeEnum.ledger;

  createdProvider.login = async (options?: {
    callbackUrl?: string;
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

    const eventBus = EventBus.getInstance();

    const updateAccountScreen = (members: Partial<IAccountScreenData>) => {
      accountScreenData = {
        ...accountScreenData,
        ...members
      };
      data.accountScreenData = accountScreenData;
      eventBus.publish('DATA_UPDATE', data);
    };

    const updateConfirmScreen = (members: Partial<IConfirmScreenData>) => {
      confirmScreenData = {
        ...authData,
        ...confirmScreenData,
        ...members
      };
      data.accountScreenData = null;
      data.confirmScreenData = confirmScreenData;
      eventBus.publish('DATA_UPDATE', data);
    };

    const closeComponent = () => {
      data.shouldClose = true;
      eventBus.publish('DATA_UPDATE', data);
    };

    const updateAccounts = async () => {
      const { startIndex } = accountScreenData;

      const hasData = allAccounts.some(
        ({ index, balance }) =>
          index === startIndex && new BigNumber(balance).isFinite()
      );

      const slicedAccounts = allAccounts.slice(
        startIndex,
        startIndex + addressesPerPage
      );

      if (hasData) {
        return updateAccountScreen({
          accounts: slicedAccounts,
          isLoading: false
        });
      }

      if (slicedAccounts.length === 0) {
        updateAccountScreen({
          isLoading: true
        });
      }

      try {
        const accountsArray = await provider.getAccounts(
          startIndex,
          addressesPerPage
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

        allAccounts = [...allAccounts, ...accountsWithBalance];

        updateAccountScreen({
          accounts: allAccounts.slice(
            startIndex,
            startIndex + addressesPerPage
          ),
          isLoading: false
        });

        const balancePromises = accountsArray.map((address) =>
          fetchAccount(address)
        );

        const balances = await Promise.all(balancePromises);

        balances.forEach((account, index) => {
          if (!account) {
            return;
          }
          const accountArrayIndex = index + startIndex;
          allAccounts[accountArrayIndex].balance = account.balance;
        });

        updateAccountScreen({
          accounts: allAccounts.slice(startIndex, startIndex + addressesPerPage)
        });
      } catch (error) {
        updateAccountScreen({
          accounts: allAccounts.slice(
            startIndex,
            startIndex + addressesPerPage
          ),
          isLoading: false
        });
        // TODO: handle here ledger error

        console.error('Failed to fetch accounts:', error);
      }
    };

    await updateAccounts();

    const selectedAccount = await new Promise<{
      address: string;
      signature: string;
      addressIndex: number;
    }>(async (resolve) => {
      eventBus.subscribe(
        'PAGE_CHANGED',
        async (payload: { action: 'next' | 'prev' }) => {
          const { startIndex } = accountScreenData;

          if (payload.action === 'next') {
            accountScreenData.startIndex = startIndex + addressesPerPage;
          }
          if (payload.action === 'prev' && startIndex > 0) {
            accountScreenData.startIndex = Math.max(
              0,
              startIndex - addressesPerPage
            );
          }

          await updateAccounts();
        }
      );

      eventBus.subscribe(
        'ACCESS_WALLET',
        async (payload: { addressIndex: number; selectedAddress: string }) => {
          updateConfirmScreen({
            selectedAddress: payload.selectedAddress
          });

          const loginInfo = options?.token
            ? await provider.tokenLogin({
                token: Buffer.from(`${options?.token}{}`),
                addressIndex: payload.addressIndex
              })
            : await hwProviderLogin({
                addressIndex: payload.addressIndex
              });

          closeComponent();

          // TODO: add ledger cancel event on catch

          resolve({
            address: loginInfo.address,
            signature: loginInfo.signature
              ? loginInfo.signature.toString('hex')
              : '',
            addressIndex: payload.addressIndex
          });
        }
      );
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

  return createdProvider;
}
