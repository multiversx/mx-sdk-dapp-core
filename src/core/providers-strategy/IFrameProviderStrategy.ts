import { IframeProvider } from '@multiversx/sdk-web-wallet-iframe-provider/out';
import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';
import { ProviderError } from 'types';

type IFrameProviderType = {
  type: IframeLoginTypes | null;
  address?: string;
};
export class IFrameProviderStrategy {
  private provider: IframeProvider | null = null;
  private address: string = '';
  private type: IframeLoginTypes | null = null;

  constructor({ type, address = '' }: IFrameProviderType) {
    this.type = type;
    this.address = address;
  }

  public createProvider = async (): Promise<IProvider> => {
    const network = networkSelector(getState());

    if (!this.type) {
      throw new Error('Provider type is not configured.');
    }

    if (!this.provider) {
      this.provider = IframeProvider.getInstance();
      await this.provider.init();
    }

    this.provider.setLoginType(this.type);
    this.provider.setWalletUrl(String(network.iframeWalletAddress));

    return this.buildProvider();
  };

  private buildProvider = () => {
    if (!this.provider) {
      throw new Error(ProviderError.notInitialized);
    }

    const provider = this.provider as unknown as IProvider;

    if (this.address) {
      provider.setAccount({ address: this.address });
    }

    return provider;
  };
}
