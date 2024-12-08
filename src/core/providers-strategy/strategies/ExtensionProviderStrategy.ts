import { ExtensionProvider } from '@multiversx/sdk-extension-provider/out/extensionProvider';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';

export class ExtensionProviderStrategy {
  private _provider: ExtensionProvider | null = null;

  public getProvider = () => this._provider;
  public getType = () => ProviderTypeEnum.extension;

  public resolve = async () => {
    const provider = ExtensionProvider.getInstance();
    await provider.init();
    this._provider = provider;
    return provider;
  };
}
