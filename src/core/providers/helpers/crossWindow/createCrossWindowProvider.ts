import { isBrowserWithPopupConfirmation } from 'constants/browser.constants';
import { safeWindow } from 'constants/window.constants';
import { defineCustomElements } from 'lib/sdkDappCoreUi';
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

  await defineCustomElements(safeWindow);

  provider.setWalletUrl(walletAddress || network.walletAddress);
  provider.setAddress(address);

  if (isBrowserWithPopupConfirmation) {
    provider.setShouldShowConsentPopup(true);
  }

  return provider;
}
