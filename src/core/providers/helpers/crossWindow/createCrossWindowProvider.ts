import { isBrowserWithPopupConfirmation } from 'constants/browser.constants';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';

export async function createCrossWindowProvider({
  address,
  walletAddress
}: {
  address: string;
  walletAddress: string;
}) {
  const provider = CrossWindowProvider.getInstance();
  await provider.init();
  provider.setWalletUrl(String(walletAddress));
  provider.setAddress(address);

  if (isBrowserWithPopupConfirmation) {
    provider.setShouldShowConsentPopup(true);
  }

  return provider;
}