import { isBrowserWithPopupConfirmation } from 'constants/browser.constants';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';

type CreateCrossWindowProviderType = {
  address?: string;
  walletAddress: string;
};

export async function createCrossWindowProvider({
  address = '',
  walletAddress
}: CreateCrossWindowProviderType) {
  const provider = CrossWindowProvider.getInstance();
  await provider.init();
  provider.setWalletUrl(String(walletAddress));
  provider.setAddress(address);

  if (isBrowserWithPopupConfirmation) {
    provider.setShouldShowConsentPopup(true);
  }

  return provider;
}
