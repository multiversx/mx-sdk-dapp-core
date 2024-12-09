import { DAppProvider } from './DAppProvider';
import { Strategy } from './models/Strategy';
import { CrossWindowProviderStrategy } from './strategies/CrossWindowProviderStrategy';
import { ExtensionProviderStrategy } from './strategies/ExtensionProviderStrategy';
import { LedgerProviderStrategy } from './strategies/LedgerProviderStrategy';
import { MetamaskProviderStrategy } from './strategies/MetamaskProviderStrategy';
import { PasskeyProviderStrategy } from './strategies/PasskeyProviderStrategy';

export class ProviderFactory {
  static strategies = {
    [Strategy.Extension]: new ExtensionProviderStrategy(),
    [Strategy.CrossWindow]: new CrossWindowProviderStrategy(),
    [Strategy.Ledger]: new LedgerProviderStrategy(),
    [Strategy.Metamask]: new MetamaskProviderStrategy(),
    [Strategy.Passkey]: new PasskeyProviderStrategy()
  };

  constructor(private address?: string) {}

  public resolve = async (strategy: Strategy) => {
    const { provider, type } =
      await ProviderFactory.strategies[strategy].resolve();
    return new DAppProvider(provider, type, this.address);
  };
}
