import { isBrowserWithPopupConfirmation } from 'constants/browser.constants';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';

interface ICreateCrossWindowProviderProps {
  address?: string;
  walletAddress?: string;
}

export async function createCrossWindowProvider({
  address = '',
  walletAddress = ''
}: ICreateCrossWindowProviderProps) {
  const network = networkSelector(getState());
  const provider = CrossWindowProvider.getInstance();
  await provider.init();
  provider.setWalletUrl(walletAddress || network.walletAddress);
  provider.setAddress(address);

  if (isBrowserWithPopupConfirmation) {
    provider.setShouldShowConsentPopup(true);
  }

  return provider;
}
