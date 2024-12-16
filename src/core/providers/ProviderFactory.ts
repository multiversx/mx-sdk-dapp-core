import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';
import { getAddress } from 'core/methods/account/getAddress';
import { CrossWindowProviderStrategy } from 'core/providers-strategy/CrossWindowProviderStrategy';
import { ExtensionProviderStrategy } from 'core/providers-strategy/ExtensionProviderStrategy';
import { IFrameProviderStrategy } from 'core/providers-strategy/IFrameProviderStrategy';
import { LedgerProviderStrategy } from 'core/providers-strategy/LedgerProviderStrategy';
import { WalletConnectProviderStrategy } from 'core/providers-strategy/WalletConnectProviderStrategy';
import { setProviderType } from 'store/actions/loginInfo/loginInfoActions';
import { setAccountProvider } from './accountProvider';
import { DappProvider } from './DappProvider/DappProvider';
import {
  ICustomProvider,
  IProvider,
  IProviderFactory,
  ProviderTypeEnum
} from './types/providerFactory.types';

export class ProviderFactory {
  private static _customProviders: ICustomProvider[] = [];

  public static customProviders(providers: ICustomProvider[]) {
    this._customProviders = providers;
  }

  public static async create({
    type
  }: IProviderFactory): Promise<DappProvider> {
    let createdProvider: IProvider | null = null;

    switch (type) {
      case ProviderTypeEnum.extension: {
        const providerInstance = new ExtensionProviderStrategy();
        createdProvider = await providerInstance.createProvider();

        break;
      }

      case ProviderTypeEnum.crossWindow: {
        const providerInstance = new CrossWindowProviderStrategy();
        createdProvider = await providerInstance.createProvider();

        break;
      }

      case ProviderTypeEnum.ledger: {
        const providerInstance = new LedgerProviderStrategy();
        createdProvider = await providerInstance.createProvider();

        break;
      }

      case ProviderTypeEnum.metamask: {
        const providerInstance = new IFrameProviderStrategy({
          type: IframeLoginTypes.metamask
        });

        createdProvider = await providerInstance.createProvider();

        break;
      }

      case ProviderTypeEnum.passkey: {
        const providerInstance = new IFrameProviderStrategy({
          type: IframeLoginTypes.passkey
        });
        createdProvider = await providerInstance.createProvider();

        break;
      }
      case ProviderTypeEnum.walletConnect: {
        const providerInstance = new WalletConnectProviderStrategy();
        createdProvider = await providerInstance.createProvider();

        break;
      }

      default: {
        const address = getAddress();

        for (const customProvider of this._customProviders) {
          if (customProvider.type === type) {
            createdProvider = await customProvider.constructor(address);
          }
        }
        break;
      }
    }

    if (!createdProvider) {
      throw new Error('Unable to create provider');
    }

    createdProvider.getType = () => type;
    const dappProvider = new DappProvider(createdProvider);

    setAccountProvider(dappProvider);
    setProviderType(type as ProviderTypeEnum);

    return dappProvider;
  }
}
