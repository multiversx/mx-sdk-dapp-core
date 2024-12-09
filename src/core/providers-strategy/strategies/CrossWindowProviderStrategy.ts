import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';

export class CrossWindowProviderStrategy {
  public resolve = async () => {
    const provider = CrossWindowProvider.getInstance();
    await provider.init();
    return { provider, type: ProviderTypeEnum.crossWindow };
  };
}
