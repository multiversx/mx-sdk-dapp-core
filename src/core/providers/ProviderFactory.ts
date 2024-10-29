import {
  IProvider,
  IProviderFactory,
  ProviderTypeEnum
} from './types/providerFactory.types';
import { createLedgerProvider } from './helpers/ledger/createLedgerProvider';
import { createCrossWindowProvider } from './helpers/crossWindow/createCrossWindowProvider';
import { createExtensionProvider } from './helpers/extension/createExtensionProvider';
import { createMetamaskProvider } from './helpers/iframe/createMetamaskProvider';
import { createWalletconnectProvider } from './helpers/walletconnect/createWalletconnectProvider';
import { networkSelector } from 'store/selectors';
import { getState } from 'store/store';

export class ProviderFactory {
  public async create({
    type,
    config,
    customProvider
  }: IProviderFactory): Promise<IProvider | undefined> {
    let createdProvider: IProvider | undefined;
    const network = networkSelector(getState());

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
        const provider = await createCrossWindowProvider({
          walletAddress: config.network.walletAddress ?? network.walletAddress,
          address: config.account?.address
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
        const provider = await createMetamaskProvider({
          address: config.account?.address
        });

        if (!provider) {
          return;
        }

        createdProvider = provider as unknown as IProvider;

        createdProvider.getType = () => {
          return ProviderTypeEnum.metamask;
        };

        break;
      }

      case ProviderTypeEnum.walletconnect: {
        createdProvider = createWalletconnectProvider({
          network: {
            ...network,
            ...config.network
          }
        });
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
