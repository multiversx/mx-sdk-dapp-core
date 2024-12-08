import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import { emptyProvider } from '../../providers/helpers/emptyProvider';

export class LedgerProviderStrategy {
  private _provider: typeof emptyProvider | null = null;

  getProvider = () => this._provider;
  getType = () => ProviderTypeEnum.ledger;

  public resolve = async () => {
    // TODO to be implemented
    const provider = emptyProvider;
    await provider.init();
    this._provider = provider;
    return provider;
  };
}
