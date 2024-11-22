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

const initialData: ILedgerModalData = {
  accountScreenData: null,
  confirmScreenData: null,
  connectScreenData: {}
};

let data = initialData;

export async function createLedgerProvider(): Promise<IProvider | null> {
  const shouldInitiateLogin = !getIsLoggedIn();
  const eventBus = EventBus.getInstance();

  if (shouldInitiateLogin) {
    initiateLedgerLogin();
  }

  const { ledgerProvider: provider, ledgerConfig } = await new Promise<
    Awaited<ReturnType<typeof getLedgerProvider>>
  >(async function buildLedgerProvider(resolve, reject) {
    const onRetry = () => buildLedgerProvider(resolve, reject);
    const onCancel = () => reject('User cancelled login');

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
      data.confirmScreenData = null;
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
    }>(async (resolve, reject) => {
      const closeComponent = () => {
        eventBus.unsubscribe('CLOSE', onCancel);
        eventBus.unsubscribe('PAGE_CHANGED', onPageChanged);
        eventBus.unsubscribe('ACCESS_WALLET', onAccessWallet);
        data.shouldClose = true;
        eventBus.publish('DATA_UPDATE', data);
      };

      const onCancel = async () => {
        await updateAccounts();
        eventBus.unsubscribe('CLOSE', onCancel);
        eventBus.unsubscribe('PAGE_CHANGED', onPageChanged);
        eventBus.unsubscribe('ACCESS_WALLET', onAccessWallet);
        reject('User cancelled login');
      };

      const onPageChanged = async (payload: { action: 'next' | 'prev' }) => {
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
      };

      const onAccessWallet = async (payload: {
        addressIndex: number;
        selectedAddress: string;
      }) => {
        updateConfirmScreen({
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
        } catch (error) {
          console.error('User rejected login:', error);
          await updateAccounts();
        }
      };

      eventBus.subscribe('CLOSE', onCancel);
      eventBus.subscribe('PAGE_CHANGED', onPageChanged);
      eventBus.subscribe('ACCESS_WALLET', onAccessWallet);
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
