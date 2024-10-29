import { WalletConnectV2Provider } from '@multiversx/sdk-wallet-connect-provider';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { createModalFunctions } from './components/WalletconnectModalComponent';
import { CurrentNetworkType } from 'types';

interface IWalletconnectProvider {
  openModal?: (connectorUri: string) => Promise<void>;
  closeModal?: () => void;
  onClientLogin?: () => Promise<void>;
  onClientLogout?: () => void;
  onClientEvent?: (event: any) => void;
  network: CurrentNetworkType;
}

export function createWalletconnectProvider(
  props: IWalletconnectProvider
): IProvider {
  const modalFunctions = createModalFunctions();
  const openModal = props.openModal ?? modalFunctions.openModal;
  const closeModal = props.closeModal ?? modalFunctions.closeModal;

  const provider = new WalletConnectV2Provider(
    prepareCallbacks(),
    props.network.chainId,
    props.network.walletConnectV2RelayAddress,
    String(props.network.walletConnectV2ProjectId)
  );

  const walletconnectLogin = provider.login;

  const createdProvider = provider as unknown as IProvider;

  function prepareCallbacks() {
    return {
      onClientLogin: async function () {
        closeModal();
        const address = provider.getAddress();
        console.log(`onClientLogin(), address: ${address}`);
      },
      onClientLogout: function () {
        console.log('onClientLogout()');
      },
      onClientEvent: function (event: any) {
        console.log('onClientEvent()', event);
      }
    };
  }

  createdProvider.login = async (options?: {
    callbackUrl?: string;
    token?: string;
  }): Promise<{ address: string; signature: string }> => {
    await provider.init();
    const { uri, approval } = await provider.connect();

    if (!uri) {
      throw 'URI not found';
    }

    await openModal?.(uri);

    try {
      const account = await walletconnectLogin({
        approval,
        token: options?.token
      });

      const address = account?.address;
      const signature = account?.signature;

      if (!account) {
        throw new Error(`Connection Proposal Refused ${account}`);
      }

      return {
        address: address || '',
        signature: signature || ''
      };
    } catch (err) {
      throw new Error(`Connection Proposal Refused, ${err}`);
    }
  };

  return createdProvider;
}
