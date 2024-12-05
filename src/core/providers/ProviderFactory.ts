import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';
import { SECOND_LOGIN_ATTEMPT_ERROR } from 'constants/errorMessages.constants';
import { getAddress } from 'core/methods/account/getAddress';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { setProviderType } from 'store/actions/loginInfo/loginInfoActions';
import { setAccountProvider } from './accountProvider';
import { DappProvider } from './DappProvider/DappProvider';
import { createCrossWindowProvider } from './helpers/crossWindow/createCrossWindowProvider';
import { createExtensionProvider } from './helpers/extension/createExtensionProvider';
import { getConfig } from './helpers/getConfig';
import { createIframeProvider } from './helpers/iframe/createIframeProvider';
import { createLedgerProvider } from './helpers/ledger/createLedgerProvider';
import { IProvider, ProviderTypeEnum } from './types/providerFactory.types';

export class ProviderFactory {
  public async create({
    type,
    config: userConfig,
    customProvider
  }: IProviderFactory): Promise<DappProvider> {
    let createdProvider: IProvider | null = null;
    const { account, UI } = await getConfig(userConfig);

    switch (type) {
      case ProviderTypeEnum.extension: {
        const provider = await createExtensionProvider();
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
        const ledgerProvider = await createLedgerProvider(
          UI.ledger.eventBus,
          UI.ledger.mount
        );

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

      case ProviderTypeEnum.custom: {
        if (!customProvider) {
          throw new Error('Unable to create custom provider provider');
        }
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
