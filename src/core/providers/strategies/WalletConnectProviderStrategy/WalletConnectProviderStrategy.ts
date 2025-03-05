import { Message, Transaction } from '@multiversx/sdk-core/out';
import {
  IProviderAccount,
  SessionEventTypes,
  SessionTypes,
  OptionalOperation
} from '@multiversx/sdk-wallet-connect-provider/out';
import { UITagsEnum } from 'constants/UITags.enum';
import { safeWindow } from 'constants/window.constants';

import { PendingTransactionsStateManager } from 'core/managers/internal/PendingTransactionsStateManager/PendingTransactionsStateManager';
import { PendingTransactionsEventsEnum } from 'core/managers/internal/PendingTransactionsStateManager/types/pendingTransactions.types';
import { WalletConnectStateManager } from 'core/managers/internal/WalletConnectStateManager/WalletConnectStateManager';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { getAccountProvider } from 'core/providers/helpers/accountProvider';
import { IProvider } from 'core/providers/types/providerFactory.types';
import {
  defineCustomElements,
  PendingTransactionsModal,
  WalletConnectModal
} from 'lib/sdkDappCoreUi';
import { logoutAction } from 'store/actions';
import {
  chainIdSelector,
  nativeAuthConfigSelector,
  walletConnectConfigSelector
} from 'store/selectors';
import { getState } from 'store/store';
import { IEventBus } from 'types/manager.types';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement } from 'utils/createUIElement';
import {
  WalletConnectOptionalMethodsEnum,
  WalletConnectV2Provider
} from 'utils/walletconnect/__sdkWalletconnectProvider';
import {
  WalletConnectEventsEnum,
  WalletConnectV2Error,
  WalletConnectConfig,
  IWalletConnectModalData
} from './types';

const dappMethods: string[] = [
  WalletConnectOptionalMethodsEnum.CANCEL_ACTION,
  WalletConnectOptionalMethodsEnum.SIGN_LOGIN_TOKEN
];

export class WalletConnectProviderStrategy {
  private provider: WalletConnectV2Provider | null = null;
  private config: WalletConnectConfig | undefined;
  private methods: string[] = [];
  private manager: WalletConnectStateManager<
    IEventBus<IWalletConnectModalData>
  > | null = null;
  private approval: (() => Promise<SessionTypes.Struct>) | null = null;
  private unsubscribeEvents: (() => void) | null = null;
  private _login:
    | ((options?: {
        approval?: () => Promise<SessionTypes.Struct>;
        token?: string;
      }) => Promise<IProviderAccount | null>)
    | null = null;
  private _signTransactions:
    | ((transactions: Transaction[]) => Promise<Transaction[]>)
    | null = null;
  private _signMessage: ((message: Message) => Promise<Message>) | null = null;

  constructor(config?: WalletConnectConfig) {
    this.config = config;
  }

  public createProvider = async (options: {
    anchor?: HTMLElement;
  }): Promise<IProvider> => {
    this.initialize();
    await defineCustomElements(safeWindow);

    const eventBus = await this.createEventBus(options.anchor);

    if (eventBus) {
      const manager = new WalletConnectStateManager(eventBus);
      this.manager = manager;
    }

    if (!this.provider && this.config) {
      const { walletConnectProvider, dappMethods } =
        await this.createWalletConnectProvider(this.config);

      // Bind in order to break reference
      this._login = walletConnectProvider.login.bind(walletConnectProvider);
      this._signTransactions = walletConnectProvider.signTransactions.bind(
        walletConnectProvider
      );
      this._signMessage = walletConnectProvider.signMessage.bind(
        walletConnectProvider
      );

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
        throw new Error(ProviderErrorsEnum.eventBusError);
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
    provider.signTransactions = this.signTransactions;
    provider.signMessage = this.signMessage;

    return provider;
  };

  private initialize = () => {
    if (this.config?.walletConnectV2ProjectId) {
      return;
    }

    const walletConnectConfig = walletConnectConfigSelector(getState());

    if (!walletConnectConfig) {
      throw new Error(WalletConnectV2Error.invalidConfig);
    }

    this.config = walletConnectConfig;
  };

  private createEventBus = async (anchor?: HTMLElement) => {
    const shouldInitiateLogin = !getIsLoggedIn();

    if (!shouldInitiateLogin) {
      return;
    }

    const modalElement = anchor
      ? await createUIElement<WalletConnectModal>({
          name: UITagsEnum.WALLET_CONNECT_MODAL
        })
      : await createUIElement<WalletConnectModal>({
          name: UITagsEnum.WALLET_CONNECT_MODAL
        });

    const eventBus = await modalElement.getEventBus();
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

    const handleOnLogout = () => {
      logoutAction();
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

  private signTransactions = async (transactions: Transaction[]) => {
    if (!this.provider || !this._signTransactions) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const modalElement = await createUIElement<PendingTransactionsModal>({
      name: UITagsEnum.PENDING_TRANSACTIONS_MODAL
    });
    const { eventBus, manager, onClose } =
      await this.getModalHandlers(modalElement);

    eventBus.subscribe(PendingTransactionsEventsEnum.CLOSE, onClose);

    manager.updateData({
      isPending: true,
      title: 'Confirm on the xPortal App',
      subtitle: 'Check your phone to sign the transaction'
    });
    try {
      const signedTransactions: Transaction[] =
        await this._signTransactions(transactions);

      return signedTransactions;
    } catch (error) {
      await this.sendCustomRequest({
        method: WalletConnectOptionalMethodsEnum.CANCEL_ACTION,
        action: OptionalOperation.CANCEL_ACTION
      });
      throw error;
    } finally {
      onClose(false);
      eventBus.unsubscribe(PendingTransactionsEventsEnum.CLOSE, onClose);
    }
  };

  private signMessage = async (message: Message) => {
    if (!this.provider || !this._signMessage) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const modalElement = await createUIElement<PendingTransactionsModal>({
      name: UITagsEnum.PENDING_TRANSACTIONS_MODAL
    });
    const { eventBus, manager, onClose } =
      await this.getModalHandlers(modalElement);

    eventBus.subscribe(PendingTransactionsEventsEnum.CLOSE, onClose);

    manager.updateData({
      isPending: true,
      title: 'Message Signing',
      subtitle: 'Check your MultiversX xPortal App to sign the message'
    });

    try {
      const signedMessage = await this._signMessage(message);

      return signedMessage;
    } catch (error) {
      await this.sendCustomRequest({
        method: WalletConnectOptionalMethodsEnum.CANCEL_ACTION,
        action: OptionalOperation.CANCEL_ACTION
      });
      throw error;
    } finally {
      onClose(false);
      eventBus.unsubscribe(PendingTransactionsEventsEnum.CLOSE, onClose);
    }
  };

  private sendCustomRequest = async ({
    action,
    method
  }: {
    action: OptionalOperation;
    method: WalletConnectOptionalMethodsEnum;
  }) => {
    if (!this.provider) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    try {
      await this.provider.sendCustomRequest?.({
        request: {
          method,
          params: { action }
        }
      });
    } catch (error) {
      console.error(WalletConnectV2Error.actionError, error);
    }
  };

  private getModalHandlers = async (modalElement: PendingTransactionsModal) => {
    const eventBus = await modalElement.getEventBus();

    if (!eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    const manager = new PendingTransactionsStateManager(eventBus);

    const onClose = async (cancelAction = true) => {
      if (!this.provider) {
        throw new Error(ProviderErrorsEnum.notInitialized);
      }

      if (cancelAction) {
        await this.sendCustomRequest({
          method: WalletConnectOptionalMethodsEnum.CANCEL_ACTION,
          action: OptionalOperation.CANCEL_ACTION
        });
      }

      manager.closeAndReset();
    };

    return { eventBus, manager, onClose };
  };
}
