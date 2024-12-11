import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { logout } from 'core/providers/DappProvider/helpers/logout/logout';
import {
  IEventBus,
  IProvider,
  IProviderConfig,
  ProviderTypeEnum
} from 'core/providers/types/providerFactory.types';
import { getWalletConnectProvider } from './helpers/getWalletConnectProvider';
import { WalletConnectStateManager } from './helpers/WalletConnectStateManagement';
import {
  WalletConnectEventsEnum,
  WalletConnectV2Error
} from './walletConnect.types';

type WalletConnectProviderProps = {
  mount: () => Promise<IEventBus>;
  config: IProviderConfig['walletConnect'];
};

export async function createWalletConnectProvider({
  mount,
  config
}: WalletConnectProviderProps): Promise<IProvider | null> {
  const shouldInitiateLogin = !getIsLoggedIn();

  let eventBus: IEventBus | undefined;
  if (shouldInitiateLogin) {
    eventBus = await mount?.();
  }

  if (!eventBus) {
    throw new Error('Event bus not provided for WalletConnect provider');
  }

  const manager = WalletConnectStateManager.getInstance(eventBus);

  const { walletConnectProvider, dappMethods } =
    await getWalletConnectProvider(config);

  const { uri = '', approval } = await walletConnectProvider.connect({
    methods: dappMethods
  });

  const createdProvider = { ...walletConnectProvider } as unknown as IProvider;
  createdProvider.getType = () => ProviderTypeEnum.walletConnect;

  manager.updateWcURI(uri);

  const onClose = () => {
    manager.closeAndReset();
  };

  eventBus.subscribe(WalletConnectEventsEnum.CLOSE, onClose);

  const unsubscribeFromEvents = () => {
    eventBus.unsubscribe(WalletConnectEventsEnum.CLOSE, onClose);
  };

  createdProvider.login = async (options?: {
    callbackUrl?: string;
    token?: string;
  }): Promise<{
    address: string;
    signature: string;
  }> => {
    const isConnected = walletConnectProvider.isConnected();

    if (isConnected) {
      throw new Error(WalletConnectV2Error.connectError);
    }

    const reconnect = async (): Promise<{
      address: string;
      signature: string;
    }> => {
      try {
        await walletConnectProvider.init();

        const { uri = '', approval: wcApproval } =
          await walletConnectProvider.connect({
            methods: dappMethods
          });

        manager.updateWcURI(uri);

        const providerInfo = await walletConnectProvider.login({
          approval: wcApproval,
          token: options?.token
        });

        const { address = '', signature = '' } = providerInfo ?? {};

        manager.closeAndReset();
        return { address, signature };
      } catch {
        console.log('Reconnecting....');
        return await reconnect();
      }
    };

    try {
      const providerData = await walletConnectProvider.login({
        approval,
        token: options?.token
      });

      const { address = '', signature = '' } = providerData ?? {};

      manager.closeAndReset();
      return { address, signature };
    } catch (err: any) {
      console.error(WalletConnectV2Error.userRejected, err);
      return await reconnect();
    } finally {
      unsubscribeFromEvents();
    }
  };

  createdProvider.logout = async (): Promise<boolean> => {
    try {
      await logout({ provider: walletConnectProvider as unknown as IProvider });
      return true;
    } catch (error) {
      console.error('Error logging out', error);
      return false;
    }
  };

  return createdProvider;
}
