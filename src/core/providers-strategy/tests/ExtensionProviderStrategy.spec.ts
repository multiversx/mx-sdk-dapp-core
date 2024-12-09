import { ExtensionProvider } from '@multiversx/sdk-extension-provider/out/extensionProvider';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import { ExtensionProviderStrategy } from '../strategies/ExtensionProviderStrategy';

jest.mock('@multiversx/sdk-extension-provider/out/extensionProvider', () => ({
  ExtensionProvider: {
    getInstance: jest.fn().mockReturnValue({
      init: jest.fn().mockResolvedValue(true)
    })
  }
}));

describe('ExtensionProviderStrategy', () => {
  it('should resolve with the correct provider and type', async () => {
    const strategy = new ExtensionProviderStrategy();
    const result = await strategy.resolve();

    expect(ExtensionProvider.getInstance).toHaveBeenCalled();
    expect(result.provider.init).toHaveBeenCalled();
    expect(result.provider).toBe(ExtensionProvider.getInstance());
    expect(result.type).toBe(ProviderTypeEnum.extension);
  });
});
