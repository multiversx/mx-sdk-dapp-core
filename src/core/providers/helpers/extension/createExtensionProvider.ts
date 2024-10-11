import { ExtensionProvider } from '@multiversx/sdk-extension-provider/out/extensionProvider';

export const createExtensionProvider = async () => {
  const provider = ExtensionProvider.getInstance();
  await provider.init();
  return provider;
};
