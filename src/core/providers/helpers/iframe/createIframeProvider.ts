import { IframeProvider } from '@multiversx/sdk-web-wallet-iframe-provider/out';
import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import { networkSelector } from 'store/selectors';
import { getState } from 'store/store';

interface ICreateIframeProviderProps {
  address?: string;
  metamaskSnapWalletAddress?: string;
  type: IframeLoginTypes.metamask | IframeLoginTypes.passkey;
}

export async function createIframeProvider({
  metamaskSnapWalletAddress,
  address = '',
  type
}: ICreateIframeProviderProps) {
  const network = networkSelector(getState());
  const provider = IframeProvider.getInstance();
  provider.setLoginType(type);
  provider.setWalletUrl(
    metamaskSnapWalletAddress || network.metamaskSnapWalletAddress || ''
  );

  if (address) {
    provider.setAccount({ address });
  }

  await provider.init();
  return provider;
}
