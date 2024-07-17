import { Transaction } from '@multiversx/sdk-core';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';

export interface IProvider {
  login: (options?: { token?: string }) => Promise<any>;
  logout: () => Promise<boolean>;
  signTransactions: (transaction: Transaction[]) => Promise<Transaction[]>;
  setAddress: (address: string) => IProvider;
  setShouldShowConsentPopup?: (shouldShow: boolean) => void;
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
  crossWindow = 'crossWindow'
}

export class ProviderFactory {
  public static async create({
    type,
    config: {
      network: { walletAddress }
    },
    address
  }: IProviderFactory): Promise<IProvider> {
    let createdProvider: IProvider;

    switch (type) {
      // case ProviderTypeEnum.iframe: {
      //   const provider = await ProviderFactory.getIframeProvider({
      //     walletAddress,
      //   });
      //   createdProvider = provider as unknown as IProvider;
      //   break;
      // }

      case ProviderTypeEnum.crossWindow: {
        const provider = await ProviderFactory.getCrossWindowProvider({
          walletAddress
        });
        createdProvider = provider as unknown as IProvider;
        break;
      }

      default:
        const provider = await ProviderFactory.getCrossWindowProvider({
          walletAddress
        });
        createdProvider = provider as unknown as IProvider;
        break;
    }

    if (address) {
      createdProvider.setAddress(address);
    }

    return createdProvider;
  }

  public static async reCreate(
    config: IProviderRecreateFactory
  ): Promise<IProvider> {
    return await ProviderFactory.create(config);
  }

  private static async getCrossWindowProvider({
    walletAddress
  }: Partial<IProviderConfig['network']>) {
    // CrossWindowProvider.getInstance().clearInstance();
    const provider = CrossWindowProvider.getInstance();
    await provider.init();
    provider.setWalletUrl(String(walletAddress));
    return provider;
  }
}
