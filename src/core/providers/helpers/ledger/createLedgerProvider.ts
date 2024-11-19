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

    const addressesPerPage = 10;
    let allAccounts: ILedgerAccount[] = [];

    let data: ILedgerModalData = {
      accounts: allAccounts,
      startIndex: 0,
      addressesPerPage,
      isLoading: true,
      showConfirm: false,
      selectedAddress: '',
      confirmScreenData,
      shouldClose: false
    };

    const sendPartialUpdate = (members: Partial<ILedgerModalData>) => {
      data = {
        ...data,
        ...members
      };

      eventBus.publish('DATA_UPDATE', data);
    };

    const updateAccounts = async () => {
      const { startIndex } = data;

      const hasData = allAccounts.some(
        ({ index, balance }) =>
          index === startIndex && new BigNumber(balance).isFinite()
      );

      const slicedAccounts = allAccounts.slice(
        startIndex,
        startIndex + addressesPerPage
      );

      if (hasData) {
        return sendPartialUpdate({
          accounts: slicedAccounts,
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

        allAccounts = [...allAccounts, ...accountsWithBalance];

        sendPartialUpdate({
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

        sendPartialUpdate({
          accounts: allAccounts.slice(startIndex, startIndex + addressesPerPage)
        });
      } catch (error) {
        sendPartialUpdate({
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
          const { startIndex } = data;

          if (payload.action === 'next') {
            data.startIndex = startIndex + addressesPerPage;
          }
          if (payload.action === 'prev' && startIndex > 0) {
            data.startIndex = Math.max(0, startIndex - addressesPerPage);
          }

          await updateAccounts();
        }
      );

      eventBus.subscribe(
        'ACCESS_WALLET',
        async (payload: { addressIndex: number; selectedAddress: string }) => {
          sendPartialUpdate({
            showConfirm: true,
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

          sendPartialUpdate({
            shouldClose: true
          });

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

    return { address: '', signature: '' };
  };

  return createdProvider;
}
