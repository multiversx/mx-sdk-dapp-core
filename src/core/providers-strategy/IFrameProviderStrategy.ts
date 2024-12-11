import { IframeProvider } from '@multiversx/sdk-web-wallet-iframe-provider/out';
import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';

export class IFrameProviderStrategy {
  private provider: IframeProvider | null = null;
  private address: string = '';
  private type: IframeLoginTypes = IframeLoginTypes.metamask;

  constructor(type: IframeLoginTypes, address: string | undefined = '') {
    this.type = type;
    this.address = address;
  }

  public createProvider = async (): Promise<IProvider> => {
    const network = networkSelector(getState());

    if (!this.provider) {
      this.provider = IframeProvider.getInstance();
      await this.provider.init();
    }

    this.provider.setLoginType(this.type);
    this.provider.setWalletUrl(String(network.metamaskSnapWalletAddress));

    return this.buildProvider();
  };

  private buildProvider = () => {
    const provider = this.provider as unknown as IProvider;

    if (this.address) {
      provider.setAccount({ address: this.address });
    }

    return provider;
  };
}
