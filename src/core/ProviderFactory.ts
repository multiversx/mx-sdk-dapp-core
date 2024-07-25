import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import type { IDAppProviderBase } from '@multiversx/sdk-dapp-utils';
import { LoginMethodsType, LoginMethodsEnum } from '../types';

export interface IProvider extends IDAppProviderBase {
  init: () => Promise<boolean>;
  // TODO change return type to { address: string, signature: string } and also change the return type in IDAppProviderBase.
  login: (options?: { token?: string }) => Promise<string | boolean>;
  logout: () => Promise<boolean>;
  setAddress: (address: string) => IProvider;
  setShouldShowConsentPopup?: (shouldShow: boolean) => void;
  getAddress(): string | undefined;
  getTokenLoginSignature(): string | undefined;
}

export interface IProviderConfig {
  network: {
    walletAddress: string;
  };
}

export type ProviderType = LoginMethodsType;

export interface IProviderFactory {
  type: ProviderType;
  config: IProviderConfig;
  customProvider?: IProvider;
}

export const ProviderTypeEnum = {
  ...LoginMethodsEnum
} as const;

export class ProviderFactory {
  public async create({
    type,
    config,
    customProvider
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

        createdProvider.getTokenLoginSignature = () => {
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

      case ProviderTypeEnum.custom: {
        createdProvider = customProvider;
        break;
      }

      default:
        break;
    }

    return createdProvider;
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
