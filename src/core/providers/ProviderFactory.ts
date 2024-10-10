import {
  IProvider,
  IProviderFactory,
  ProviderTypeEnum
} from './types/providerFactory.types';
import { createLedgerProvider } from './helpers/ledger/createLedgerProvider';
import { createCrossWindowProvider } from './helpers/crossWindow/createCrossWindowProvider';
import { createExtensionProvider } from './helpers/extension/createExtensionProvider';
import { createMetamaskProvider } from './helpers/iframe/createMetamaskProvider';

console.log('\x1b[42m%s\x1b[0m', 'sdk-dapp-core', 2);

export class ProviderFactory {
  public async create({
    type,
    config,
    customProvider
  }: IProviderFactory): Promise<IProvider | undefined> {
    let createdProvider: IProvider | undefined;

    switch (type) {
      case ProviderTypeEnum.extension: {
        const provider = await createExtensionProvider();
        createdProvider = provider as unknown as IProvider;

        createdProvider.getType = () => {
          return ProviderTypeEnum.extension;
        };

        break;
      }

      case ProviderTypeEnum.crossWindow: {
        const { walletAddress } = config.network;

        const provider = await createCrossWindowProvider({
          walletAddress,
          address: config.account?.address || ''
        });
        createdProvider = provider as unknown as IProvider;

        createdProvider.getType = () => {
          return ProviderTypeEnum.crossWindow;
        };

        break;
      }

      case ProviderTypeEnum.ledger: {
        const ledgerProvider = await createLedgerProvider();

        if (!ledgerProvider) {
          return;
        }

        createdProvider = ledgerProvider;

        break;
      }

      case ProviderTypeEnum.metamask: {
        const provider = await createMetamaskProvider(
          'https://signing-providers.multiversx.com'
        );

        if (!provider) {
          return;
        }

        createdProvider = provider as unknown as IProvider;

        createdProvider.getType = () => {
          return ProviderTypeEnum.metamask;
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
}
