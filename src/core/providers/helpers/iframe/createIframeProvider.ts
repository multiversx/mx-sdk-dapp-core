import { IframeProvider } from '@multiversx/sdk-web-wallet-iframe-provider/out';
import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';

interface ICreateIframeProviderProps {
  address?: string;
  metamaskSnapWalletAddress: string;
  type: IframeLoginTypes.metamask | IframeLoginTypes.passkey;
}

export async function createIframeProvider({
  metamaskSnapWalletAddress,
  address = '',
  type
}: ICreateIframeProviderProps) {
  const provider = IframeProvider.getInstance();
  provider.setLoginType(type);
  provider.setWalletUrl(metamaskSnapWalletAddress);

  if (address) {
    provider.setAccount({ address });
  }

  await provider.init();
  return provider;
}
