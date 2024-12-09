import { emptyProvider } from 'core/providers/helpers/emptyProvider';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';

export class MetamaskProviderStrategy {
  public resolve = async () => {
    // TODO to be implemented
    const provider = emptyProvider;
    await provider.init();
    return { provider, type: ProviderTypeEnum.metamask };
  };
}
