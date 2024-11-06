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
import { networkSelector } from 'store/selectors';
import { getState } from 'store/store';

export class ProviderFactory {
  public async create({
    type,
    config,
    customProvider
  }: IProviderFactory): Promise<IProvider | undefined> {
    let createdProvider: IProvider | undefined;
    const { metamaskSnapWalletAddress = '', walletAddress } = {
      ...networkSelector(getState()),
      ...config.network
    };

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
          walletAddress,
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
        const provider = await createIframeProvider({
          address: config.account?.address,
          metamaskSnapWalletAddress,
          type: IframeLoginTypes.metamask
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

      case ProviderTypeEnum.passkey: {
        const provider = await createIframeProvider({
          address: config.account?.address,
          metamaskSnapWalletAddress,
          type: IframeLoginTypes.passkey
        });

        if (!provider) {
          return;
        }

        createdProvider = provider as unknown as IProvider;

        createdProvider.getType = () => {
          return ProviderTypeEnum.passkey;
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
