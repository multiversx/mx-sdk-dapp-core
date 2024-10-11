import { isBrowserWithPopupConfirmation } from 'constants/browser.constants';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';

interface ICreateCrossWindowProviderProps {
  address?: string;
  walletAddress: string;
}

export async function createCrossWindowProvider({
  address = '',
  walletAddress
}: ICreateCrossWindowProviderProps) {
  const provider = CrossWindowProvider.getInstance();
  await provider.init();
  provider.setWalletUrl(String(walletAddress));
  provider.setAddress(address);

  if (isBrowserWithPopupConfirmation) {
    provider.setShouldShowConsentPopup(true);
  }

  return provider;
}
