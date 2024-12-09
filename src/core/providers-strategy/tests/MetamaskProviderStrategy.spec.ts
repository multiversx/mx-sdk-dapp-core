import { emptyProvider } from 'core/providers/helpers/emptyProvider';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import { MetamaskProviderStrategy } from '../strategies/MetamaskProviderStrategy';

jest.mock('core/providers/helpers/emptyProvider', () => ({
  emptyProvider: {
    init: jest.fn().mockResolvedValue(true)
  }
}));

describe('MetamaskProviderStrategy', () => {
  it('should resolve with the correct provider and type', async () => {
    const strategy = new MetamaskProviderStrategy();
    const result = await strategy.resolve();

    expect(emptyProvider.init).toHaveBeenCalled();
    expect(result.provider).toBe(emptyProvider);
    expect(result.type).toBe(ProviderTypeEnum.metamask);
  });
});
