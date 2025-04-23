import { Message, Transaction } from '@multiversx/sdk-core/out';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider/out/extensionProvider';
import { PendingTransactionsEventsEnum } from 'core/managers/internal/PendingTransactionsStateManager/types/pendingTransactions.types';

import { getAddress } from 'core/methods/account/getAddress';
import {
  IProvider,
  providerLabels
} from 'core/providers/types/providerFactory.types';
import { ProviderErrorsEnum } from 'types/provider.types';
import { getPendingTransactionsHandlers } from '../helpers/getPendingTransactionsHandlers';
import { signMessage } from '../helpers/signMessage/signMessage';

export class ExtensionProviderStrategy {
  private address: string = '';
  private provider: ExtensionProvider | null = null;
  private _signTransactions:
    | ((transactions: Transaction[]) => Promise<Transaction[]>)
    | null = null;
  private _signMessage: ((message: Message) => Promise<Message>) | null = null;
  private _login:
    | ((options?: {
        callbackUrl?: string;
        token?: string;
      }) => Promise<{ address: string; signature?: string }>)
    | null = null;
  private loginAbortController: AbortController | null = null;

  constructor(address?: string) {
    this.address = address || '';
  }

  public createProvider = async (): Promise<IProvider> => {
    this.initialize();

    if (!this.provider) {
      this.provider = ExtensionProvider.getInstance();
      await this.provider.init();
    }
    this._login = this.provider.login.bind(this.provider);
    this._signTransactions = this.provider.signTransactions.bind(this.provider);
    this._signMessage = this.provider.signMessage.bind(this.provider);

    return this.buildProvider();
  };

  private login = async (options?: {
    callbackUrl?: string;
    token?: string;
  }) => {
    if (!this.provider || !this._login) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    this.cancelLogin(); // Cancel any existing login attempt

    this.loginAbortController = new AbortController();
    const signal = this.loginAbortController.signal;

    // TODO: maybe integrate idle state manager here
    try {
      const loginPromise = this._login(options); // Create a promise that can be cancelled

      const abortPromise = new Promise<never>((_, reject) => {
        signal.addEventListener('abort', () => {
          reject(new Error('Login cancelled'));
        });
      });

      const { address, signature } = await Promise.race([
        loginPromise,
        abortPromise
      ]);

      this.loginAbortController = null;
      return { address, signature: signature ?? '' };
    } catch (error) {
      this.loginAbortController = null;
      throw error;
    }
  };

  public cancelLogin = () => {
    if (this.loginAbortController) {
      this.loginAbortController.abort();
      this.loginAbortController = null;
    }

    if (this.provider && this.provider.cancelAction) {
      this.provider.cancelAction();
    }
  };

  private buildProvider = () => {
    if (!this.provider) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const provider = this.provider as unknown as IProvider;
    provider.login = this.login;
    provider.signTransactions = this.signTransactions;
    provider.signMessage = this.signMessage;
    provider.setAccount({ address: this.address });

    // Add the cancelLogin method to the provider
    provider.cancelLogin = this.cancelLogin;

    return provider;
  };

  private initialize = () => {
    if (this.address) {
      return;
    }

    const address = getAddress();

    if (!address) {
      return;
    }

    this.address = address;
  };

  private signTransactions = async (transactions: Transaction[]) => {
    if (!this.provider || !this._signTransactions) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const { eventBus, manager, onClose } = await getPendingTransactionsHandlers(
      {
        cancelAction: this.provider.cancelAction.bind(this.provider)
      }
    );

    eventBus.subscribe(
      PendingTransactionsEventsEnum.CLOSE_PENDING_TRANSACTIONS,
      onClose
    );

    manager.updateData({
      isPending: true,
      title: 'Confirm on MultiversX DeFi Wallet',
      subtitle: 'Check your MultiversX Wallet Extension to sign the transaction'
    });

    try {
      const signedTransactions: Transaction[] =
        (await this._signTransactions(transactions)) ?? [];

      return signedTransactions;
    } catch (error) {
      await onClose({ shouldCancelAction: false }); // action was triggered by user in extension, no need to retrigger it

      throw error;
    } finally {
      manager.closeAndReset();
      eventBus.unsubscribe(
        PendingTransactionsEventsEnum.CLOSE_PENDING_TRANSACTIONS,
        onClose
      );
    }
  };

  private signMessage = async (message: Message) => {
    if (!this.provider || !this._signMessage) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const signedMessage = await signMessage({
      message,
      handleSignMessage: this._signMessage.bind(this.provider),
      cancelAction: this.provider.cancelAction.bind(this.provider),
      providerType: providerLabels.extension
    });

    return signedMessage;
  };
}
