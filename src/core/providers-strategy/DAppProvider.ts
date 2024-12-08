import { Strategy } from './models/Strategy';
import { ProviderContainer } from './ProviderContainer';
import { CrossWindowProviderStrategy } from './strategies/CrossWindowProviderStrategy';
import { ExtensionProviderStrategy } from './strategies/ExtensionProviderStrategy';
import { LedgerProviderStrategy } from './strategies/LedgerProviderStrategy';
import { MetamaskProviderStrategy } from './strategies/MetamaskProviderStrategy';
import { PasskeyProviderStrategy } from './strategies/PasskeyProviderStrategy';

export class DAppProvider {
  static strategies = {
    [Strategy.Extension]: new ExtensionProviderStrategy(),
    [Strategy.CrossWindow]: new CrossWindowProviderStrategy(),
    [Strategy.Ledger]: new LedgerProviderStrategy(),
    [Strategy.Metamask]: new MetamaskProviderStrategy(),
    [Strategy.Passkey]: new PasskeyProviderStrategy()
  };

  constructor(private address?: string) {}

  public resolve = async (strategy: Strategy) => {
    const provider = await DAppProvider.strategies[strategy].resolve();

    return new ProviderContainer(provider, this.address);
  };
}
