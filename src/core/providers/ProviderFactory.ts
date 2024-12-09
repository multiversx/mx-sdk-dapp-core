import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';
import { SECOND_LOGIN_ATTEMPT_ERROR } from 'constants/errorMessages.constants';
import { getAddress } from 'core/methods/account/getAddress';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { setProviderType } from 'store/actions/loginInfo/loginInfoActions';
import { setAccountProvider } from './accountProvider';
import { DappProvider } from './DappProvider/DappProvider';
import { createCrossWindowProvider } from './helpers/crossWindow/createCrossWindowProvider';
import { createExtensionProvider } from './helpers/extension/createExtensionProvider';
import { createIframeProvider } from './helpers/iframe/createIframeProvider';
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
    type
  }: IProviderFactory): Promise<DappProvider> {
    let createdProvider: IProvider | null = null;
    const address = getAddress();

    switch (type) {
      case ProviderTypeEnum.extension: {
        const provider = await createExtensionProvider();
        createdProvider = provider as unknown as IProvider;

        createdProvider.getType = () => ProviderTypeEnum.extension;

        break;
      }

      case ProviderTypeEnum.crossWindow: {
        const provider = await createCrossWindowProvider({
          address
        });
        createdProvider = provider as unknown as IProvider;

        createdProvider.getType = () => ProviderTypeEnum.crossWindow;

        break;
      }

      case ProviderTypeEnum.ledger: {
        const ledgerProvider = await createLedgerProvider();

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
        const provider = await createIframeProvider({
          address,
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
          address,
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
            createdProvider = await customProvider.constructor();
            createdProvider.getType = () => type;
          }
        }
        break;
      }
    }

    if (!createdProvider) {
      throw new Error('Unable to create provider');
    }

    const dappProvider = new DappProvider(createdProvider);

    setAccountProvider(dappProvider);
    setProviderType(type as ProviderTypeEnum);

    return dappProvider;
  }
}
