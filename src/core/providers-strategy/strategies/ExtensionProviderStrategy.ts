import { ExtensionProvider } from '@multiversx/sdk-extension-provider/out/extensionProvider';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';

export class ExtensionProviderStrategy {
  public resolve = async () => {
    const provider = ExtensionProvider.getInstance();
    await provider.init();
    return { provider, type: ProviderTypeEnum.extension };
  };
}
