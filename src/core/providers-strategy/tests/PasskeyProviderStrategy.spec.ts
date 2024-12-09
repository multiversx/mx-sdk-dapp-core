import { emptyProvider } from 'core/providers/helpers/emptyProvider';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import { PasskeyProviderStrategy } from '../strategies/PasskeyProviderStrategy';

jest.mock('core/providers/helpers/emptyProvider', () => ({
  emptyProvider: {
    init: jest.fn().mockResolvedValue(true)
  }
}));

describe('PasskeyProviderStrategy', () => {
  it('should resolve with the correct provider and type', async () => {
    const strategy = new PasskeyProviderStrategy();
    const result = await strategy.resolve();

    expect(emptyProvider.init).toHaveBeenCalled();
    expect(result.provider).toBe(emptyProvider);
    expect(result.type).toBe(ProviderTypeEnum.passkey);
  });
});
