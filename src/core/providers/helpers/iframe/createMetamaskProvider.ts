import { IframeProvider } from '@multiversx/sdk-web-wallet-iframe-provider/out';
import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';
import { networkSelector } from 'store/selectors';
import { getState } from 'store/store';

export async function createMetamaskProvider(
  customMetamaskSnapWalletAddress?: string
) {
  const network = networkSelector(getState());
  const provider = IframeProvider.getInstance();
  provider.setLoginType(IframeLoginTypes.metamask);
  provider.setWalletUrl(
    customMetamaskSnapWalletAddress || network.metamaskSnapWalletAddress || ''
  );

  await provider.init();
  return provider;
}
