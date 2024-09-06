import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import {
  IProvider,
  IProviderConfig,
  IProviderFactory,
  ProviderTypeEnum
} from './types/providerFactory.types';
import { isBrowserWithPopupConfirmation } from '../../constants';

export class ProviderFactory {
  public async create({
    type,
    config,
    customProvider
  }: IProviderFactory): Promise<IProvider | undefined> {
    let createdProvider: IProvider | undefined;

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
          return Promise.resolve(provider.account.address);
        };

        createdProvider.getTokenLoginSignature = () => {
          return provider.account.signature;
        };

        createdProvider.getType = () => {
          return ProviderTypeEnum.extension;
        };

        break;
      }

      case ProviderTypeEnum.crossWindow: {
        const { walletAddress } = config.network;

        const provider = await this.getCrossWindowProvider({
          walletAddress,
          address: config.account?.address || ''
        });
        createdProvider = provider as unknown as IProvider;

        createdProvider.getType = () => {
          return ProviderTypeEnum.crossWindow;
        };

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
    address,
    walletAddress
  }: {
    address: string;
    walletAddress: string;
  }) {
    const provider = CrossWindowProvider.getInstance();
    await provider.init();
    provider.setWalletUrl(String(walletAddress));
    provider.setAddress(address);

    if (isBrowserWithPopupConfirmation) {
      provider.setShouldShowConsentPopup(true);
    }

    return provider;
  }

  private async getExtensionProvider() {
    const provider = ExtensionProvider.getInstance();
    await provider.init();
    return provider;
  }
}
