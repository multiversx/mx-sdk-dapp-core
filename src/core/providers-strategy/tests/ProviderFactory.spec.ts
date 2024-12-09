import { ProviderTypeEnum } from '../../providers/types/providerFactory.types';
import { DAppProvider } from '../DAppProvider';
import { Strategy } from '../models/Strategy';
import { ProviderFactory } from '../ProviderFactory';

const mockProvider = {
  init: jest.fn(),
  getType: jest.fn().mockReturnValue(ProviderTypeEnum.extension),
  address: 'test-address'
};

jest.mock('../DAppProvider', () => ({
  DAppProvider: jest.fn().mockImplementation(() => mockProvider)
}));

describe('ProviderFactory', () => {
  it('should initialize with the correct type and address', async () => {
    const providerFactory = new ProviderFactory('test-address');
    const dappProvider = await providerFactory.resolve(Strategy.Extension);

    expect(providerFactory).toBeDefined();
    expect(dappProvider.getType()).toBe(ProviderTypeEnum.extension);
    expect(dappProvider.address).toBe('test-address');
  });

  it('should resolve the correct strategy and return a DAppProvider', async () => {
    const providerFactory = new ProviderFactory('test-address');
    const mockStrategyResolve = jest
      .fn()
      .mockResolvedValue({ provider: mockProvider, type: Strategy.Extension });
    ProviderFactory.strategies[Strategy.Extension].resolve =
      mockStrategyResolve;
    const dappProvider = await providerFactory.resolve(Strategy.Extension);

    expect(mockStrategyResolve).toHaveBeenCalled();
    expect(dappProvider).toBe(mockProvider);
    expect(DAppProvider).toHaveBeenCalledWith(
      mockProvider,
      Strategy.Extension,
      'test-address'
    );
  });

  it('should throw an error if strategy is not found', async () => {
    const providerFactory = new ProviderFactory('test-address');
    const invalidStrategy = 'InvalidStrategy' as Strategy;
    await expect(providerFactory.resolve(invalidStrategy)).rejects.toThrow();
  });
});
