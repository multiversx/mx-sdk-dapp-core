import { IframeProvider } from '@multiversx/sdk-web-wallet-iframe-provider/out';
import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';

interface ICreateIframeProviderProps {
  address?: string;
  type: IframeLoginTypes.metamask | IframeLoginTypes.passkey;
}

export async function createIframeProvider({
  address = '',
  type
}: ICreateIframeProviderProps) {
  const network = networkSelector(getState());

  const provider = IframeProvider.getInstance();
  provider.setLoginType(type);
  provider.setWalletUrl(String(network.metamaskSnapWalletAddress));

  if (address) {
    provider.setAccount({ address });
  }

  await provider.init();
  return provider;
}
