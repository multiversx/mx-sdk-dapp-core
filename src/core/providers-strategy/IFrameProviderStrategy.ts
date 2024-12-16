import { IframeProvider } from '@multiversx/sdk-web-wallet-iframe-provider/out';
import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';
import { getAccount } from 'core/methods/account/getAccount';
import { getAddress } from 'core/methods/account/getAddress';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';
import { ProviderErrorsEnum } from 'types';

type IFrameProviderType = {
  type: IframeLoginTypes | null;
  address?: string;
};
export class IFrameProviderStrategy {
  private provider: IframeProvider | null = null;
  private address?: string;
  private type: IframeLoginTypes | null = null;

  constructor({ type, address }: IFrameProviderType) {
    this.type = type;
    this.address = address;
  }

  public createProvider = async (): Promise<IProvider> => {
    this.validateConfig();
    const network = networkSelector(getState());

    if (!this.type) {
      throw new Error(ProviderErrorsEnum.invalidConfig);
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
    const { address } = getAccount();

    if (!this.provider) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const provider = this.provider as unknown as IProvider;

    provider.setAccount({ address: this.address || address });

    return provider;
  };

  private validateConfig = () => {
    if (!this.type) {
      throw new Error(ProviderErrorsEnum.invalidConfig);
    }

    if (!this.address) {
      const address = getAddress();

      if (address) {
        this.address = address;
        return;
      }

      throw new Error(ProviderErrorsEnum.invalidConfig);
    }
  };
}
