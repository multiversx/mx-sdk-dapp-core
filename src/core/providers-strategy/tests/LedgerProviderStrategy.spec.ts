import { emptyProvider } from 'core/providers/helpers/emptyProvider';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import { LedgerProviderStrategy } from '../strategies/LedgerProviderStrategy';

jest.mock('core/providers/helpers/emptyProvider', () => ({
  emptyProvider: {
    init: jest.fn().mockResolvedValue(true)
  }
}));

describe('LedgerProviderStrategy', () => {
  it('should resolve with the correct provider and type', async () => {
    const strategy = new LedgerProviderStrategy();
    const result = await strategy.resolve();

    expect(emptyProvider.init).toHaveBeenCalled();
    expect(result.provider).toBe(emptyProvider);
    expect(result.type).toBe(ProviderTypeEnum.ledger);
  });
});
