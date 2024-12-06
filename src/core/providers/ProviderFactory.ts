import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';
import { setProviderType } from 'store/actions/loginInfo/loginInfoActions';
import { setAccountProvider } from './accountProvider';
import { DappProvider } from './DappProvider/DappProvider';
import { createCrossWindowProvider } from './helpers/crossWindow/createCrossWindowProvider';
import { createExtensionProvider } from './helpers/extension/createExtensionProvider';
import { getConfig } from './helpers/getConfig';
import { createIframeProvider } from './helpers/iframe/createIframeProvider';
import { LedgerDappProvider } from './helpers/ledger/LedgerDappProvider';
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
    type,
    config: userConfig // TODO: remove config and get address from store
  }: IProviderFactory): Promise<DappProvider> {
    let createdProvider: IProvider | null = null;
    const config = await getConfig(userConfig);
    const { account } = config;
    let dappProvider: DappProvider | null = null;

    switch (type) {
      case ProviderTypeEnum.extension: {
        const provider = await createExtensionProvider(); // TODO: make classes
        createdProvider = provider as unknown as IProvider;
        createdProvider.getType = () => ProviderTypeEnum.extension;

        break;
      }

      case ProviderTypeEnum.crossWindow: {
        const provider = await createCrossWindowProvider({
          address: account?.address
        });
        createdProvider = provider as unknown as IProvider;

        createdProvider.getType = () => ProviderTypeEnum.crossWindow;

        break;
      }

      case ProviderTypeEnum.ledger: {
        dappProvider = new LedgerDappProvider();
        await dappProvider.init?.();

        break;
      }

      case ProviderTypeEnum.metamask: {
        const provider = await createIframeProvider({
          address: account?.address,
          type: IframeLoginTypes.metamask
        });

        if (!provider) {
          throw new Error('Unable to create metamask provider');
        }

        createdProvider = provider as unknown as IProvider;

        createdProvider.getType = () => ProviderTypeEnum.metamask;

        break;
      }

      case ProviderTypeEnum.passkey: {
        const provider = await createIframeProvider({
          address: account?.address,
          type: IframeLoginTypes.passkey
        });

        if (!provider) {
          throw new Error('Unable to create passkey provider');
        }

        createdProvider = provider as unknown as IProvider;

        createdProvider.getType = () => ProviderTypeEnum.passkey;

        break;
      }

      default: {
        for (const customProvider of this._customProviders) {
          if (customProvider.type === type) {
            dappProvider = new customProvider.constructor();
            dappProvider.getType = () => type;
          }
        }
        break;
      }
    }

    if (dappProvider == null) {
      throw new Error('Unable to create provider');
    }

    // dappProvider = new DappProvider(createdProvider);

    setAccountProvider(dappProvider);
    setProviderType(type as ProviderTypeEnum);

    return dappProvider;
  }
}
