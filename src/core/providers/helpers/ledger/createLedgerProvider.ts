import {
  IProvider,
  ProviderTypeEnum
} from 'core/providers/types/providerFactory.types';
import { getLedgerProvider } from './getLedgerProvider';
import { setLedgerLogin } from 'store/actions/loginInfo/loginInfoActions';
import { setLedgerAccount } from 'store/actions/account/accountActions';
import { initiateLedgerLogin } from './components/LedgerModalComponent';
import { CurrentNetworkType } from 'types/network.types';

interface ILedgerProvider {
  openModal?: () => Promise<void>;
  network: CurrentNetworkType;
}

export async function createLedgerProvider(
  props?: ILedgerProvider
): Promise<IProvider | null> {
  const data = await getLedgerProvider();

  console.log('props', props);

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

    if (!isConnected) {
      throw new Error('Ledger device is not connected');
    }

    const onSubmit = async ({ addressIndex }: { addressIndex: number }) => {
      const loginInfo = options?.token
        ? await provider.tokenLogin({
            token: Buffer.from(`${options?.token}{}`),
            addressIndex
          })
        : await hwProviderLogin({
            addressIndex
          });

      return {
        address: loginInfo.address,
        signature: loginInfo.signature
          ? loginInfo.signature.toString('hex')
          : ''
      };
    };

    const {
      address,
      addressIndex,
      signature = ''
    } = await initiateLedgerLogin({
      getAccounts: provider.getAccounts.bind(provider),
      onSubmit
    });

    const { version, dataEnabled } = ledgerConfig;

    setLedgerLogin({
      index: addressIndex,
      loginType: ProviderTypeEnum.ledger
    });

    setLedgerAccount({
      address,
      index: addressIndex,
      version,
      hasContractDataEnabled: dataEnabled
    });

    return { address, signature };
  };

  return createdProvider;
}
