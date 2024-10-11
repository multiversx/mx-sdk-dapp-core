import { ExtensionProvider } from '@multiversx/sdk-extension-provider/out/extensionProvider';

export async function createExtensionProvider() {
  const provider = ExtensionProvider.getInstance();
  await provider.init();
  return provider;
}
