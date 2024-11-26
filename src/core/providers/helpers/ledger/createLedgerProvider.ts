import BigNumber from 'bignumber.js';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import {
  IProvider,
  ProviderTypeEnum
} from 'core/providers/types/providerFactory.types';
import { setLedgerAccount } from 'store/actions/account/accountActions';
import { setLedgerLogin } from 'store/actions/loginInfo/loginInfoActions';
import { fetchAccount } from 'utils/account/fetchAccount';
import { EventBus } from './components/EventBus';
import { initiateLedgerLogin } from './components/initiateLedgerLogin';
import { getAuthTokenText } from './components/LedgerConnectModal/helpers/getAuthTokenText';
import { getLedgerErrorCodes } from './getLedgerErrorCodes';
import { getLedgerProvider } from './getLedgerProvider';
import {
  IAccountScreenData,
  IConfirmScreenData,
  IConnectScreenData,
  ILedgerConnectModalData,
  LedgerConnectEventsEnum
} from './ledger.types';
import { ILedgerAccount } from './ledger.types';

const failInitializeErrorText = 'Check if the MultiversX App is open on Ledger';
const addressesPerPage = 10;
let allAccounts: ILedgerAccount[] = [];

const initialAcccountScreenData: IAccountScreenData = {
  accounts: allAccounts,
  startIndex: 0,
  addressesPerPage,
  isLoading: true
};

let accountScreenData = initialAcccountScreenData;

const initialConfirmScreenData: IConfirmScreenData = {
  selectedAddress: ''
};

let confirmScreenData = initialConfirmScreenData;

const initialConnectScreenData: IConnectScreenData = {};

let connectScreenData = initialConnectScreenData;

const initialData: ILedgerConnectModalData = {
  connectScreenData: initialConnectScreenData,
  accountScreenData: null,
  confirmScreenData: null
};

let data = initialData;

function resetData() {
  accountScreenData = initialAcccountScreenData;
  confirmScreenData = initialConfirmScreenData;
  connectScreenData = initialConnectScreenData;
  data = initialData;
}

export async function createLedgerProvider(): Promise<IProvider | null> {
  const shouldInitiateLogin = !getIsLoggedIn();
  const eventBus = EventBus.getInstance();

  if (shouldInitiateLogin) {
    initiateLedgerLogin();
  }

  const updateConnectScreen = (members: Partial<IConnectScreenData>) => {
    connectScreenData = {
      ...connectScreenData,
      ...members
    };
    data.confirmScreenData = null;
    data.accountScreenData = null;
    eventBus.publish(LedgerConnectEventsEnum.DATA_UPDATE, data);
  };

  const updateAccountScreen = (members: Partial<IAccountScreenData>) => {
    accountScreenData = {
      ...accountScreenData,
      ...members
    };
    data.confirmScreenData = null;
    data.accountScreenData = accountScreenData;

    eventBus.publish(LedgerConnectEventsEnum.DATA_UPDATE, data);
  };

  const { ledgerProvider: provider, ledgerConfig } = await new Promise<
    Awaited<ReturnType<typeof getLedgerProvider>>
  >(async function buildLedgerProvider(resolve, reject) {
    const onRetry = () => buildLedgerProvider(resolve, reject);
    const onCancel = () => reject('User cancelled login');

    try {
      updateAccountScreen({
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

      updateConnectScreen({
        error: errorMessage ?? defaultErrorMessage ?? failInitializeErrorText
      });

      eventBus.publish(LedgerConnectEventsEnum.DATA_UPDATE, data);

      eventBus.subscribe(LedgerConnectEventsEnum.CONNECT_DEVICE, onRetry);

      eventBus.subscribe(LedgerConnectEventsEnum.CLOSE, onCancel);
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

    const updateConfirmScreen = (members: Partial<IConfirmScreenData>) => {
      confirmScreenData = {
        ...authData,
        ...confirmScreenData,
        ...members
      };
      data.accountScreenData = null;
      data.confirmScreenData = confirmScreenData;

      eventBus.publish(LedgerConnectEventsEnum.DATA_UPDATE, data);
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

        resetData();

        eventBus.publish(LedgerConnectEventsEnum.DATA_UPDATE, {
          ...data,
          shouldClose: true
        });
      };

      const onCancel = async () => {
        await updateAccounts();

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
        reject('User cancelled login');
      };

      const onNextPageChanged = async () => {
        const { startIndex } = accountScreenData;
        accountScreenData.startIndex = startIndex + addressesPerPage;
        await updateAccounts();
      };

      const onPrevPageChanged = async () => {
        const { startIndex } = accountScreenData;

        if (startIndex > 0) {
          accountScreenData.startIndex = Math.max(
            0,
            startIndex - addressesPerPage
          );

          await updateAccounts();
        }
      };

      const onAccessWallet = async function tryAccessWallet(payload: {
        addressIndex: number;
        selectedAddress: string;
      }) {
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
        } catch (err) {
          console.error('User rejected login:', err);
          const shouldGoBack = Boolean(confirmScreenData);
          if (shouldGoBack) {
            await updateAccounts();
          }
          const shouldClose = Boolean(accountScreenData);
          if (shouldClose) {
            closeComponent();
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

  return createdProvider;
}
