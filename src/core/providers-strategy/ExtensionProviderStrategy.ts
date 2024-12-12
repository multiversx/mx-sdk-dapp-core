import { ExtensionProvider } from '@multiversx/sdk-extension-provider/out/extensionProvider';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { ProviderError } from 'types';

export class ExtensionProviderStrategy {
  private provider: ExtensionProvider | null = null;

  public createProvider = async (): Promise<IProvider> => {
    if (!this.provider) {
      this.provider = ExtensionProvider.getInstance();
      await this.provider.init();
    }

    return this.buildProvider();
  };

  private buildProvider = () => {
    if (!this.provider) {
      throw new Error(ProviderError.notInitialized);
    }

    return this.provider as unknown as IProvider;
  };
}
