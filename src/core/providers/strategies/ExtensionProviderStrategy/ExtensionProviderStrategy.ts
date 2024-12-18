import { Transaction } from '@multiversx/sdk-core/out';
import { IDAppProviderOptions } from '@multiversx/sdk-dapp-utils/out';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider/out/extensionProvider';
import { getAddress } from 'core/methods/account/getAddress';
import { signTransactions } from 'core/providers/helpers/signTransactions/signTransactions';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { Nullable, ProviderErrorsEnum } from 'types';

export class ExtensionProviderStrategy {
  private address: string = '';
  private provider: ExtensionProvider | null = null;

  private _signTransactions:
    | ((
        transactions: Transaction[],
        options?: IDAppProviderOptions
      ) => Promise<Nullable<Transaction[]>>)
    | null = null;

  constructor(address?: string) {
    this.address = address || '';
  }

  public createProvider = async (): Promise<IProvider> => {
    this.initialize();

    if (!this.provider) {
      const instance = ExtensionProvider.getInstance();
      this._signTransactions = instance.signTransactions.bind(instance);
      this.provider = instance;
      await this.provider.init();
    }

    return this.buildProvider();
  };

  private signTransactions = async (transactions: Transaction[]) => {
    if (!this._signTransactions) {
      throw new Error('Sign transactions method is not initialized');
    }

    const signedTransactions = await signTransactions({
      transactions,
      handleSign: this._signTransactions
    });
    return signedTransactions;
  };

  private buildProvider = () => {
    if (!this.provider) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const provider = this.provider as unknown as IProvider;
    provider.setAccount({ address: this.address });
    provider.signTransactions = this.signTransactions;
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
}
