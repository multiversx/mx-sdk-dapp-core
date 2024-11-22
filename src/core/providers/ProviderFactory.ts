import {
  IProvider,
  IProviderFactory,
  ProviderTypeEnum
} from './types/providerFactory.types';
import { createLedgerProvider } from './helpers/ledger/createLedgerProvider';
import { createCrossWindowProvider } from './helpers/crossWindow/createCrossWindowProvider';
import { createExtensionProvider } from './helpers/extension/createExtensionProvider';
import { createIframeProvider } from './helpers/iframe/createIframeProvider';
import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { getAddress } from 'core/methods/account/getAddress';
import { SECOND_LOGIN_ATTEMPT_ERROR } from 'constants/errorMessages.constants';
import { setAccountProvider } from './accountProvider';
import { setProviderType } from 'store/actions/loginInfo/loginInfoActions';
import { DappProvider } from './DappProvider/DappProvider';

export class ProviderFactory {
  public async create({
    type,
    config,
    customProvider
  }: IProviderFactory): Promise<DappProvider | undefined> {
    let createdProvider: IProvider | undefined;

    switch (type) {
      case ProviderTypeEnum.extension: {
        const provider = await createExtensionProvider();
        createdProvider = provider as unknown as IProvider;

        createdProvider.getType = () => ProviderTypeEnum.extension;

        break;
      }

      case ProviderTypeEnum.crossWindow: {
        const provider = await createCrossWindowProvider({
          address: config?.account?.address
        });
        createdProvider = provider as unknown as IProvider;

        createdProvider.getType = () => ProviderTypeEnum.crossWindow;

        break;
      }

      case ProviderTypeEnum.ledger: {
        const ledgerProvider = await createLedgerProvider();

        if (!ledgerProvider) {
          return;
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
          address: config?.account?.address,
          type: IframeLoginTypes.metamask
        });

        if (!provider) {
          return;
        }

        createdProvider = provider as unknown as IProvider;

        createdProvider.getType = () => ProviderTypeEnum.metamask;

        break;
      }

      case ProviderTypeEnum.passkey: {
        const provider = await createIframeProvider({
          address: config?.account?.address,
          type: IframeLoginTypes.passkey
        });

        if (!provider) {
          return;
        }

        createdProvider = provider as unknown as IProvider;

        createdProvider.getType = () => ProviderTypeEnum.passkey;

        break;
      }

      case ProviderTypeEnum.custom: {
        createdProvider = customProvider;
        break;
      }

      default:
        break;
    }

    if (!createdProvider) {
      throw new Error('Unable to create provider');
    }

    const dappProvider = new DappProvider(createdProvider);

    setAccountProvider(dappProvider);
    setProviderType(type);

    return dappProvider;
  }
}
