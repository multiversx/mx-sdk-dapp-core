import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import { emptyProvider } from '../../providers/helpers/emptyProvider';

export class MetamaskProviderStrategy {
  private _provider: typeof emptyProvider | null = null;

  getProvider = () => this._provider;
  getType = () => ProviderTypeEnum.metamask;

  public resolve = async () => {
    // TODO to be implemented
    const provider = emptyProvider;
    await provider.init();
    this._provider = provider;
    return provider;
  };
}
