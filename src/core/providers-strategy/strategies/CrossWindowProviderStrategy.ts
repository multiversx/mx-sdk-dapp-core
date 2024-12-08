import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';

export class CrossWindowProviderStrategy {
  private _provider: CrossWindowProvider | null = null;

  getProvider = () => this._provider;
  getType = () => ProviderTypeEnum.crossWindow;

  public resolve = async () => {
    const provider = CrossWindowProvider.getInstance();
    await provider.init();
    this._provider = provider;
    return provider;
  };
}
