import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { CrossWindowProviderStrategy } from '../strategies/CrossWindowProviderStrategy';

jest.mock('lib/sdkWebWalletCrossWindowProvider', () => ({
  CrossWindowProvider: {
    getInstance: jest.fn().mockReturnValue({
      init: jest.fn().mockResolvedValue(true)
    })
  }
}));

describe('CrossWindowProviderStrategy', () => {
  it('should resolve with the correct provider and type', async () => {
    const strategy = new CrossWindowProviderStrategy();
    const result = await strategy.resolve();

    expect(CrossWindowProvider.getInstance).toHaveBeenCalled();
    expect(result.provider.init).toHaveBeenCalled();
    expect(result.provider).toBe(CrossWindowProvider.getInstance());
    expect(result.type).toBe(ProviderTypeEnum.crossWindow);
  });
});
