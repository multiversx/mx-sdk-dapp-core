import { IframeProvider } from '@multiversx/sdk-web-wallet-iframe-provider/out';
import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';
import { networkSelector } from 'store/selectors';
import { getState } from 'store/store';

interface ICreateMetamaskProviderProps {
  address?: string;
  metamaskSnapWalletAddress?: string;
}

export const createMetamaskProvider = async ({
  metamaskSnapWalletAddress,
  address = ''
}: ICreateMetamaskProviderProps) => {
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
};
