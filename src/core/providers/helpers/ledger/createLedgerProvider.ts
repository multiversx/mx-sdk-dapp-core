import {
  IProvider,
  ProviderTypeEnum
} from 'core/providers/types/providerFactory.types';
import { getLedgerProvider } from './getLedgerProvider';
import { fetchAccount } from 'utils/account/fetchAccount';
import { setLedgerLogin } from 'store/actions/loginInfo/loginInfoActions';
import { setLedgerAccount } from 'store/actions/account/accountActions';
import { createModalFunctions } from './components/LedgerModalComponent';
import { CurrentNetworkType } from 'types/network.types';
import { ILedgerAccount } from './ledger.types';

interface ILedgerProvider {
  openModal?: () => Promise<void>;
  closeModal?: () => void;
  updateLedgerAccounts?: (wallets: ILedgerAccount[]) => void;
  network: CurrentNetworkType;
}

export async function createLedgerProvider(
  props: ILedgerProvider
): Promise<IProvider | null> {
  const data = await getLedgerProvider();
  const modalFunctions = createModalFunctions();

  const openModal = props.openModal ?? modalFunctions.openModal;
  const updateLedgerAccounts =
    props.updateLedgerAccounts ?? modalFunctions.updateLedgerAccounts;
  const closeModal = props.closeModal ?? modalFunctions.closeModal;

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
    console.log('start');
    openModal();

    const isConnected = provider.isConnected();

    if (!isConnected) {
      throw new Error('Ledger device is not connected');
    }

    // TODO: perform additional UI logic here
    // maybe extract to file
    const startIndex = 0;
    const addressesPerPage = 10;

    const accounts = await provider.getAccounts(startIndex, addressesPerPage);

    const accountsWithBalance: ILedgerAccount[] = [];

    const balancePromises = accounts.map((address) => fetchAccount(address));

    const balances = await Promise.all(balancePromises);

    balances.forEach((account, index) => {
      if (!account) {
        return;
      }
      accountsWithBalance.push({
        address: account.address,
        balance: account.balance,
        index
      });
    });

    updateLedgerAccounts(accountsWithBalance);

    // Suppose user selects the first account
    // const selectedIndex = 0;

    // setLedgerLogin({
    //   index: selectedIndex,
    //   loginType: ProviderTypeEnum.ledger
    // });

    // const { version, dataEnabled } = ledgerConfig;

    // closeModal();

    // setLedgerAccount({
    //   address: accountsWithBalance[selectedIndex].address,
    //   index: selectedIndex,
    //   version,
    //   hasContractDataEnabled: dataEnabled
    // });

    // if (options?.token) {
    //   const loginInfo = await provider.tokenLogin({
    //     token: Buffer.from(`${options?.token}{}`),
    //     addressIndex: accountsWithBalance[selectedIndex].index
    //   });

    //   return {
    //     address: loginInfo.address,
    //     signature: loginInfo.signature.toString('hex')
    //   };
    // } else {
    //   const { address } = await hwProviderLogin({
    //     addressIndex: accountsWithBalance[selectedIndex].index
    //   });

    return {
      address: options + '',
      signature: ''
    };
    // }
  };

  return createdProvider;
}
