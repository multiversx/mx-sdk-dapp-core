import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';
import { SECOND_LOGIN_ATTEMPT_ERROR } from 'constants/errorMessages.constants';
import { getAddress } from 'core/methods/account/getAddress';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { CrossWindowProviderStrategy } from 'core/providers-strategy/CrossWindowProviderStrategy';
import { CustomProviderStrategy } from 'core/providers-strategy/CustomProviderStrategy';
import { ExtensionProviderStrategy } from 'core/providers-strategy/ExtensionProviderStrategy';
import { IFrameProviderStrategy } from 'core/providers-strategy/IFrameProviderStrategy';
import { WalletConnectProviderStrategy } from 'core/providers-strategy/WalletConnectProviderStrategy';
import { setProviderType } from 'store/actions/loginInfo/loginInfoActions';
import { setAccountProvider } from './accountProvider';
import { DappProvider } from './DappProvider/DappProvider';
import { getConfig } from './helpers/getConfig';
import { createLedgerProvider } from './helpers/ledger/createLedgerProvider';
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
    config: userConfig
  }: IProviderFactory): Promise<DappProvider> {
    let createdProvider: IProvider | null = null;
    const config = await getConfig(userConfig);
    const { account, UI, walletConnect } = config;

    switch (type) {
      case ProviderTypeEnum.extension: {
        const providerInstance = new ExtensionProviderStrategy();
        createdProvider = await providerInstance.createProvider();

        break;
      }

      case ProviderTypeEnum.crossWindow: {
        const providerInstance = new CrossWindowProviderStrategy(
          account?.address
        );

        createdProvider = await providerInstance.createProvider();

        break;
      }

      case ProviderTypeEnum.ledger: {
        const ledgerProvider = await createLedgerProvider(UI.ledger.mount);

        if (!ledgerProvider) {
          throw new Error('Unable to create ledger provider');
        }

        createdProvider = ledgerProvider;

        createdProvider.getType = () => ProviderTypeEnum.ledger;

        const loggedIn = getIsLoggedIn();

        if (loggedIn) {
          console.warn('Already logged in with:', getAddress());
          throw new Error(SECOND_LOGIN_ATTEMPT_ERROR);
        }

        await createdProvider.init?.();

        break;
      }

      case ProviderTypeEnum.metamask: {
        const providerInstance = new IFrameProviderStrategy(
          IframeLoginTypes.metamask,
          account?.address
        );

        createdProvider = await providerInstance.createProvider();

        break;
      }

      case ProviderTypeEnum.passkey: {
        const providerInstance = new IFrameProviderStrategy(
          IframeLoginTypes.passkey,
          account?.address
        );

        createdProvider = await providerInstance.createProvider();

        break;
      }
      case ProviderTypeEnum.walletConnect: {
        const providerInstance = new WalletConnectProviderStrategy(
          walletConnect
        );

        createdProvider = await providerInstance.createProvider();

        break;
      }

      default: {
        for (const customProvider of this._customProviders) {
          const providerInstance = new CustomProviderStrategy({
            type: type as string,
            customProvider,
            config
          });

          createdProvider = await providerInstance.createProvider();
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
