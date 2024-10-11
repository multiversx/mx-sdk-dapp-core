import { IframeProvider } from '@multiversx/sdk-web-wallet-iframe-provider/out';
import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';
import { networkSelector } from 'store/selectors';
import { getState } from 'store/store';

type CreateMetamaskProviderType = {
  address?: string;
  metamaskSnapWalletAddress?: string;
};

export async function createMetamaskProvider({
  metamaskSnapWalletAddress,
  address = ''
}: CreateMetamaskProviderType) {
  const network = networkSelector(getState());
  const provider = IframeProvider.getInstance();
  provider.setLoginType(IframeLoginTypes.metamask);
  provider.setWalletUrl(
    metamaskSnapWalletAddress || network.metamaskSnapWalletAddress || ''
  );

  if (address) {
    provider.setAccount({ address });
  }

  await provider.init();
  return provider;
}
