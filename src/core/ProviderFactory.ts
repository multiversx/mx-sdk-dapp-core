import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import type { IDAppProviderBase } from '@multiversx/sdk-dapp-utils';

export interface IProvider extends IDAppProviderBase {
  init: () => Promise<boolean>;
  login: (options?: { token?: string }) => Promise<string | boolean>;
  relogin?: () => Promise<void>;
  logout: () => Promise<boolean>;
  setAddress: (address: string) => IProvider;
  setShouldShowConsentPopup?: (shouldShow: boolean) => void;
  getAddress(): string | undefined;
  getSignature(): string | undefined;
}
export interface IProviderConfig {
  network: {
    walletAddress: string;
  };
}
export interface IProviderFactory {
  type: ProviderTypeEnum;
  config: IProviderConfig;
  address?: string;
}

export interface IProviderRecreateFactory extends IProviderFactory {
  address: string;
}

export enum ProviderTypeEnum {
  iframe = 'iframe',
  crossWindow = 'crossWindow',
  extension = 'extension',
  walletConnect = 'walletConnect',
  hardware = 'hardware',
  opera = 'opera',
  metamask = 'metamask',
  wallet = 'wallet',
}

export class ProviderFactory {
  public async create({
    type,
    config,
  }: IProviderFactory): Promise<IProvider | undefined> {
    let createdProvider: IProvider | undefined = undefined;

    switch (type) {
      // case ProviderTypeEnum.iframe: {
      //   const provider = await ProviderFactory.getIframeProvider({
      //     walletAddress,
      //   });
      //   createdProvider = provider as unknown as IProvider;
      //   break;
      // }

      case ProviderTypeEnum.extension: {
        const provider = await this.getExtensionProvider();
        createdProvider = provider as unknown as IProvider;

        createdProvider.getAddress = () => {
          return provider.account.address;
        }

        createdProvider.getSignature = () => {
          return provider.account.signature;
        }

        break;
      }

      case ProviderTypeEnum.crossWindow: {
        const { walletAddress } = config.network;

        const provider = await this.getCrossWindowProvider({
          walletAddress
        });
        createdProvider = provider as unknown as IProvider;

        break;
      }

      default:
        break;
    }

    return createdProvider;
  }

  public static async reCreate(
    config: IProviderRecreateFactory
  ): Promise<IProvider | undefined> {
    const factory = new ProviderFactory();
    return await factory.create(config);
  }

  private async getCrossWindowProvider({
    walletAddress
  }: Partial<IProviderConfig['network']>) {
    // CrossWindowProvider.getInstance().clearInstance();
    const provider = CrossWindowProvider.getInstance();
    await provider.init();
    provider.setWalletUrl(String(walletAddress));
    return provider;
  }

  private async getExtensionProvider() {
    const provider = ExtensionProvider.getInstance();
    await provider.init();
    return provider;
  }
}
