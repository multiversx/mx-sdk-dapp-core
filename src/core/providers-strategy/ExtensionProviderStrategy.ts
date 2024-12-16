import { ExtensionProvider } from '@multiversx/sdk-extension-provider/out/extensionProvider';
import { getAddress } from 'core/methods/account/getAddress';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { ProviderErrorsEnum } from 'types';

export class ExtensionProviderStrategy {
  private address: string = '';
  private provider: ExtensionProvider | null = null;

  constructor(address?: string) {
    this.address = address || '';
  }

  public createProvider = async (): Promise<IProvider> => {
    this.initialize();

    if (!this.provider) {
      this.provider = ExtensionProvider.getInstance();
      await this.provider.init();
    }

    return this.buildProvider();
  };

  private buildProvider = () => {
    if (!this.provider) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const provider = this.provider as unknown as IProvider;
    provider.setAccount({ address: this.address });
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
