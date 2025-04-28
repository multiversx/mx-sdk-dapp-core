import { Message, Transaction } from '@multiversx/sdk-core/out';
import {
  IProviderAccount,
  WebviewProvider
} from '@multiversx/sdk-webview-provider/out/WebviewProvider';
import { safeWindow } from 'constants/window.constants';
import { getAddress } from 'core/methods/account/getAddress';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { ProviderErrorsEnum } from 'types/provider.types';

type WebviewProviderProps = {
  address?: string;
};

export class WebviewProviderStrategy {
  private provider: WebviewProvider | null = null;
  private address: string;
  private _signTransactions:
    | ((transactions: Transaction[]) => Promise<Transaction[] | null>)
    | null = null;
  private _signMessage: ((message: Message) => Promise<Message | null>) | null =
    null;
  private _login:
    | ((options?: {
        callbackUrl?: string;
        token?: string;
      }) => Promise<IProviderAccount | null>)
    | null = null;
  private loginAbortController: AbortController | null = null;

  constructor(config?: WebviewProviderProps) {
    this.address = config?.address || '';
  }

  public createProvider = async (): Promise<IProvider> => {
    this.initialize();

    if (!this.provider) {
      this.provider = WebviewProvider.getInstance({
        resetStateCallback: () => {
          safeWindow.localStorage?.clear?.();
          safeWindow.sessionStorage?.clear?.();
        }
      });
      await this.provider.init();
    }

    this._signTransactions = this.provider.signTransactions.bind(this.provider);
    this._signMessage = this.provider.signMessage.bind(this.provider);
    this._login = this.provider.login.bind(this.provider);

    return this.buildProvider();
  };

  private buildProvider = () => {
    if (!this.provider) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const provider = this.provider as unknown as IProvider;

    provider.setAccount({ address: this.address });
    provider.login = this.login;
    provider.signTransactions = this.signTransactions;
    provider.signMessage = this.signMessage;
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

  private login = async (options?: {
    callbackUrl?: string;
    token?: string;
  }) => {
    if (!this.provider || !this._login) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    this.cancelLogin();
    this.loginAbortController = new AbortController();
    const signal = this.loginAbortController.signal;

    try {
      const loginPromise = this._login(options);
      const abortPromise = new Promise<never>((_, reject) => {
        signal.addEventListener('abort', () => {
          reject(new Error('Login cancelled'));
        });
      });

      const response = await Promise.race([loginPromise, abortPromise]);

      this.loginAbortController = null;
      return {
        address: response?.address ?? '',
        signature: response?.signature ?? ''
      };
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

  private signTransactions = async (transactions: Transaction[]) => {
    if (!this.provider || !this._signTransactions) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    try {
      const signedTransactions = await this._signTransactions(transactions);
      return signedTransactions || [];
    } catch (error) {
      this.provider.cancelAction();
      throw error;
    }
  };

  private signMessage = async (message: Message) => {
    if (!this.provider || !this._signMessage) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    try {
      const signedMessage = await this._signMessage(message);
      return signedMessage;
    } catch (error) {
      this.provider.cancelAction();
      throw error;
    }
  };
}
