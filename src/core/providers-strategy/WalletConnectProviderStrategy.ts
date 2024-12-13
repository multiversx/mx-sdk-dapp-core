import {
  IProviderAccount,
  SessionEventTypes,
  SessionTypes
} from '@multiversx/sdk-wallet-connect-provider/out';
import { safeWindow } from 'constants/window.constants';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { getAccountProvider } from 'core/providers/accountProvider';
import {
  WalletConnectEventsEnum,
  WalletConnectV2Error,
  WalletConnectConfig
} from 'core/providers/helpers/walletConnect/walletConnect.types';
import { WalletConnectStateManager } from 'core/providers/helpers/walletConnect/WalletConnectStateManagement';
import {
  IEventBus,
  IProvider
} from 'core/providers/types/providerFactory.types';
import { defineCustomElements, WalletConnectModal } from 'lib/sdkDappCoreUi';
import { logoutAction } from 'store/actions';
import { setWalletConnectConfig } from 'store/actions/config/configActions';
import { chainIdSelector, nativeAuthConfigSelector } from 'store/selectors';
import { getState } from 'store/store';
import { ProviderErrorsEnum } from 'types';
import {
  WalletConnectOptionalMethodsEnum,
  WalletConnectV2Provider
} from 'utils/walletconnect/__sdkWalletconnectProvider';

const dappMethods: string[] = [
  WalletConnectOptionalMethodsEnum.CANCEL_ACTION,
  WalletConnectOptionalMethodsEnum.SIGN_LOGIN_TOKEN
];

export class WalletConnectProviderStrategy {
  private provider: WalletConnectV2Provider | null = null;
  private config: WalletConnectConfig | null;
  private methods: string[] = [];
  private manager: WalletConnectStateManager<IEventBus> | null = null;
  private approval: (() => Promise<SessionTypes.Struct>) | null = null;
  private unsubscribeEvents: (() => void) | null = null;
  private _login:
    | ((options?: {
        approval?: () => Promise<SessionTypes.Struct>;
        token?: string;
      }) => Promise<IProviderAccount | null>)
    | null = null;

  constructor(config: WalletConnectConfig | null) {
    this.config = config;
  }

  public createProvider = async (): Promise<IProvider> => {
    this.validateConfig();
    await defineCustomElements(safeWindow);

    const eventBus = await this.createEventBus();

    if (eventBus) {
      const manager = WalletConnectStateManager.getInstance(eventBus);
      this.manager = manager;
    }

    if (!this.provider && this.config) {
      const { walletConnectProvider, dappMethods } =
        await this.createWalletConnectProvider(this.config);

      // Bind in order to break reference
      this._login = walletConnectProvider.login.bind(walletConnectProvider);
      this.provider = walletConnectProvider;
      this.methods = dappMethods;
    }

    const onClose = () => {
      if (!this.manager) {
        throw new Error('State manager is not initialized');
      }

      this.manager.closeAndReset();
    };

    this.unsubscribeEvents = () => {
      if (!eventBus) {
        throw new Error('Event bus is not initialized');
      }

      eventBus.unsubscribe(WalletConnectEventsEnum.CLOSE, onClose);
    };

    if (eventBus && this.manager && this.provider) {
      const { uri = '', approval } = await this.provider.connect({
        methods: this.methods
      });

      this.approval = approval;
      this.manager.updateWcURI(uri);

      eventBus.subscribe(WalletConnectEventsEnum.CLOSE, onClose);
    }

    return this.buildProvider();
  };

  private buildProvider = () => {
    if (!this.provider) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const provider = this.provider as unknown as IProvider;
    provider.login = this.login;

    return provider;
  };

  private validateConfig = () => {
    if (!this.config?.walletConnectV2ProjectId) {
      throw new Error(WalletConnectV2Error.invalidConfig);
    }

    setWalletConnectConfig(this.config);
  };

  private createEventBus = async () => {
    const shouldInitiateLogin = !getIsLoggedIn();

    let eventBus: IEventBus | undefined;
    if (shouldInitiateLogin) {
      const walletConnectModalElement = document.createElement(
        'wallet-connect-modal'
      ) as WalletConnectModal;
      document.body.appendChild(walletConnectModalElement);
      await customElements.whenDefined('wallet-connect-modal');

      eventBus = await walletConnectModalElement.getEventBus();

      if (!eventBus) {
        throw new Error('Event bus not provided for WalletConnect provider');
      }
    }

    return eventBus;
  };

  private createWalletConnectProvider = async (config: WalletConnectConfig) => {
    const isLoggedIn = getIsLoggedIn();
    const chainId = chainIdSelector(getState());
    const provider = getAccountProvider();
    const nativeAuthConfig = nativeAuthConfigSelector(getState());

    if (nativeAuthConfig) {
      dappMethods.push(WalletConnectOptionalMethodsEnum.SIGN_NATIVE_AUTH_TOKEN);
    }

    if (!config?.walletConnectV2ProjectId) {
      throw new Error(WalletConnectV2Error.invalidConfig);
    }

    const handleOnLogin = () => {};

    const handleOnLogout = async () => {
      logoutAction();

      if (config.logoutRoute) {
        safeWindow.location.replace(config.logoutRoute);
      }
    };

    const handleOnEvent = (_event: SessionEventTypes['event']) => {};

    const providerHandlers = {
      onClientLogin: handleOnLogin,
      onClientLogout: handleOnLogout,
      onClientEvent: handleOnEvent
    };

    try {
      const {
        walletConnectV2ProjectId,
        walletConnectV2Options = {},
        walletConnectV2RelayAddress = ''
      } = config;
      const walletConnectProvider = new WalletConnectV2Provider(
        providerHandlers,
        chainId,
        walletConnectV2RelayAddress,
        walletConnectV2ProjectId,
        walletConnectV2Options
      );

      await walletConnectProvider.init();

      return { walletConnectProvider, dappMethods };
    } catch (err) {
      console.error(WalletConnectV2Error.connectError, err);

      if (isLoggedIn) {
        await provider.logout();
      }

      throw err;
    }
  };

  private login = async (options?: {
    token?: string;
  }): Promise<{
    address: string;
    signature: string;
  }> => {
    if (!this.provider || !this.manager) {
      throw new Error(
        'Provider or manager is not initialized. Call createProvider first.'
      );
    }

    const isConnected = this.provider.isConnected();

    if (isConnected) {
      throw new Error(WalletConnectV2Error.connectError);
    }

    const reconnect = async (): Promise<{
      address: string;
      signature: string;
    }> => {
      if (!this.provider || !this.manager) {
        throw new Error(ProviderErrorsEnum.notInitialized);
      }

      if (!this._login) {
        throw new Error('Login method is not initialized.');
      }

      try {
        await this.provider.init();

        const { uri = '', approval: wcApproval } = await this.provider.connect({
          methods: this.methods
        });

        this.manager.updateWcURI(uri);

        const providerInfo = await this._login({
          approval: wcApproval,
          token: options?.token
        });

        const { address = '', signature = '' } = providerInfo ?? {};

        this.manager.closeAndReset();
        this.unsubscribeEvents?.();
        return { address, signature };
      } catch {
        return await reconnect();
      }
    };

    if (!this.approval || !this._login) {
      throw new Error('Approval or login is not initialized');
    }

    try {
      const providerData = await this._login({
        approval: this.approval,
        token: options?.token
      });

      const { address = '', signature = '' } = providerData ?? {};

      this.manager.closeAndReset();
      this.unsubscribeEvents?.();
      return { address, signature };
    } catch (error) {
      console.error(WalletConnectV2Error.userRejected, error);
      return await reconnect();
    }
  };
}
