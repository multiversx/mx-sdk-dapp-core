import {
  IProvider,
  ProviderTypeEnum
} from 'core/providers/types/providerFactory.types';
import { getLedgerProvider } from './getLedgerProvider';
import { setLedgerLogin } from 'store/actions/loginInfo/loginInfoActions';
import { setLedgerAccount } from 'store/actions/account/accountActions';
import { initiateLedgerLogin } from './components/initiateLedgerLogin';
import { CurrentNetworkType } from 'types/network.types';
import { EventBus } from './components/EventBus';
import { ILedgerAccount } from './ledger.types';
import { fetchAccount } from 'utils/account/fetchAccount';
import { getAuthTokenText } from './components/LedgerModalComponent/helpers/getAuthTokenText';
import BigNumber from 'bignumber.js';

interface ILedgerProvider {
  openModal?: () => Promise<void>;
  network: CurrentNetworkType;
}

export async function createLedgerProvider(
  props?: ILedgerProvider
): Promise<IProvider | null> {
  const data = await getLedgerProvider();

  if ('a'.toString() == 'b') {
    console.log('props', props);
  }

  if (!data) {
    return null;
  }

  const { ledgerProvider: provider, ledgerConfig } = data;

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
    if ('a'.toString() == 'b') {
      console.log(options);
    }

    if (!isConnected) {
      throw new Error('Ledger device is not connected');
    }

    const confirmScreenData = getAuthTokenText({
      loginToken: options?.token,
      version: ledgerConfig.version
    });

    const eventBus = EventBus.getInstance();
    initiateLedgerLogin();

    let accounts: ILedgerAccount[] = [];
    let startIndex = 0;
    const addressesPerPage = 10;
    let selectedIndex: number | undefined;

    const updateAccounts = async () => {
      const hasData = accounts.some(
        ({ index, balance }) =>
          index === startIndex && new BigNumber(balance).isFinite()
      );

      if (hasData) {
        return eventBus.publish('DATA_UPDATE', {
          accounts: accounts.slice(startIndex, startIndex + addressesPerPage),
          startIndex,
          addressesPerPage,
          isLoading: false,
          showConfirm: false,
          selectedAddress: 0,
          confirmScreenData
        });
      }

      if (accounts.length === 0) {
        return eventBus.publish('DATA_UPDATE', {
          accounts: [],
          startIndex,
          addressesPerPage,
          isLoading: true,
          showConfirm: false,
          selectedAddress: 0,
          confirmScreenData
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

        accounts = [...accounts, ...accountsWithBalance];

        eventBus.publish('DATA_UPDATE', {
          accounts: accounts.slice(startIndex, startIndex + addressesPerPage),
          startIndex,
          addressesPerPage,
          isLoading: false,
          showConfirm: false,
          selectedAddress: 0,
          confirmScreenData
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
          accounts[accountArrayIndex].balance = account.balance;
        });

        eventBus.publish('DATA_UPDATE', {
          accounts: accounts.slice(startIndex, startIndex + addressesPerPage),
          startIndex,
          addressesPerPage,
          isLoading: false,
          showConfirm: false,
          selectedAddress: 0,
          confirmScreenData
        });
      } catch (error) {
        eventBus.publish('DATA_UPDATE', {
          accounts: accounts.slice(startIndex, startIndex + addressesPerPage),
          startIndex,
          addressesPerPage,
          isLoading: false,
          showConfirm: false,
          selectedAddress: 0,
          confirmScreenData
        });

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
        async (data: { action: 'next' | 'prev' }) => {
          if (data.action === 'next') {
            startIndex = startIndex + addressesPerPage;
          }
          if (data.action === 'prev' && startIndex > 0) {
            startIndex = Math.max(0, startIndex - addressesPerPage);
          }

          await updateAccounts();
        }
      );

      eventBus.subscribe(
        'ACCESS_WALLET',
        async (data: { addressIndex: number }) => {
          selectedIndex = data.addressIndex;
          eventBus.publish('DATA_UPDATE', {
            accounts: accounts.slice(startIndex, startIndex + addressesPerPage),
            startIndex,
            addressesPerPage,
            isLoading: false,
            showConfirm: true,
            selectedAddress: 0,
            confirmScreenData
          });
        }
      );

      eventBus.subscribe('ON_SUBMIT', async (data: any) => {
        const loginInfo = options?.token
          ? await provider.tokenLogin({
              token: Buffer.from(`${options?.token}{}`),
              addressIndex: data.addressIndex
            })
          : await hwProviderLogin({
              addressIndex: data.addressIndex
            });

        resolve({
          address: loginInfo.address,
          signature: loginInfo.signature
            ? loginInfo.signature.toString('hex')
            : '',
          addressIndex: data.addressIndex
        });
      });
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

    return { address: '', signature: '' };
  };

  return createdProvider;
}
