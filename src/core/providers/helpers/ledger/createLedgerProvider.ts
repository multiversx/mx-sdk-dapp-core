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
import { ILedgerModalData } from './components/LedgerModalComponent/LedgerModalComponent';

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

    let data: ILedgerModalData = {
      accounts,
      startIndex,
      addressesPerPage,
      isLoading: true,
      showConfirm: false,
      selectedAddress: '',
      confirmScreenData
    };

    const sendPartialUpdate = (members: Partial<ILedgerModalData>) => {
      data = {
        ...data,
        ...members
      };

      console.log('\x1b[42m%s\x1b[0m', 'update with: data', data);

      eventBus.publish('DATA_UPDATE', data);
    };

    const updateAccounts = async () => {
      const hasData = data.accounts.some(
        ({ index, balance }) =>
          index === startIndex && new BigNumber(balance).isFinite()
      );

      const slicedAccounts = data.accounts.slice(
        startIndex,
        startIndex + addressesPerPage
      );

      if (hasData) {
        return sendPartialUpdate({
          accounts: data.accounts.slice(
            startIndex,
            startIndex + addressesPerPage
          ),
          isLoading: false
        });
      }

      if (slicedAccounts.length === 0) {
        sendPartialUpdate({
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

        accounts = [...accounts, ...accountsWithBalance];

        sendPartialUpdate({
          accounts: accounts.slice(startIndex, startIndex + addressesPerPage),
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
          accounts[accountArrayIndex].balance = account.balance;
        });

        sendPartialUpdate({
          accounts: accounts.slice(startIndex, startIndex + addressesPerPage)
        });
      } catch (error) {
        sendPartialUpdate({
          accounts: accounts.slice(startIndex, startIndex + addressesPerPage),
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
        async (data: { addressIndex: number; selectedAddress: string }) => {
          sendPartialUpdate({
            showConfirm: true,
            selectedAddress: data.selectedAddress
          });
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

    return { address: '', signature: '' };
  };

  return createdProvider;
}
