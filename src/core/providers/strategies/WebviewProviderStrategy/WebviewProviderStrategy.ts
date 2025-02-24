import { Message, Transaction } from '@multiversx/sdk-core/out';
import { WebviewProvider } from '@multiversx/sdk-webview-provider/out/WebviewProvider';
import { safeWindow } from 'constants/window.constants';
import { getAddress } from 'core/methods/account/getAddress';
import { clearInitiatedLogins } from 'core/providers/helpers/clearInitiatedLogins';
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
  private _signMessage:
    | ((messageToSign: Message) => Promise<Message | null>)
    | null = null;

  constructor(config?: WebviewProviderProps) {
    this.address = config?.address || '';
  }

  public createProvider = async (): Promise<IProvider> => {
    this.initialize();

    if (!this.provider) {
      clearInitiatedLogins();

      this.provider = WebviewProvider.getInstance({
        resetStateCallback: () => {
          safeWindow.localStorage?.clear?.();
          safeWindow.sessionStorage?.clear?.();
        }
      });

      await this.provider.init();
    }

    // Bind in order to break reference
    this._signTransactions = this.provider.signTransactions.bind(this.provider);
    this._signMessage = this.provider.signMessage.bind(this.provider);

    return this.buildProvider();
  };

  private buildProvider = () => {
    if (!this.provider) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const provider = this.provider as unknown as IProvider;

    provider.setAccount({ address: this.address });
    provider.signTransactions = this.signTransactions;
    provider.signMessage = this.signMessage;

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
