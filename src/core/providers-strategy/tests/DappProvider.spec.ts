import { DAppProvider } from '../DAppProvider';
import { Strategy } from '../models/Strategy';
import { ProviderContainer } from '../ProviderContainer';

jest.mock('../ProviderContainer');

describe('DAppProvider', () => {
  // let dappProvider: DAppProvider;
  //
  // beforeEach(() => {
  //   dappProvider = new DAppProvider('test-address');
  // });

  it('should initialize with the correct address', () => {
    const dappProvider = new DAppProvider('test-address');
    expect(dappProvider).toBeDefined();
    expect(dappProvider['address']).toBe('test-address');
  });

  it('should resolve the correct strategy', async () => {
    const dappProvider = new DAppProvider('test-address');
    const mockProvider = { init: jest.fn() };
    DAppProvider.strategies[Strategy.Extension].resolve = jest
      .fn()
      .mockResolvedValue(mockProvider);

    const providerContainer = await dappProvider.resolve(Strategy.Extension);

    expect(
      DAppProvider.strategies[Strategy.Extension].resolve
    ).toHaveBeenCalled();
    expect(providerContainer).toBeInstanceOf(ProviderContainer);
    expect(ProviderContainer).toHaveBeenCalledWith(
      mockProvider,
      'test-address'
    );
  });

  it('should throw an error if strategy is not found', async () => {
    const dappProvider = new DAppProvider('test-address');

    const invalidStrategy = 'InvalidStrategy' as Strategy;

    await expect(dappProvider.resolve(invalidStrategy)).rejects.toThrow();
  });
});
