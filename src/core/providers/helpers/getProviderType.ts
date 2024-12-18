import { ProviderTypeEnum } from '../types/providerFactory.types';
import { CrossWindowProvider } from '@multiversx/sdk-web-wallet-cross-window-provider/out/CrossWindowProvider/CrossWindowProvider';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider/out/extensionProvider';
import { IframeProvider } from '@multiversx/sdk-web-wallet-iframe-provider/out';
import { HWProvider } from '@multiversx/sdk-hw-provider';
import {
  WalletConnectV2Provider
} from 'utils/walletconnect/__sdkWalletconnectProvider';

export const getProviderType = <TProvider extends object>(
  provider?: TProvider | null
): ProviderTypeEnum => {
  switch (provider?.constructor) {
    case CrossWindowProvider:
      return ProviderTypeEnum.crossWindow;
    case ExtensionProvider:
      return ProviderTypeEnum.extension;
    case IframeProvider:
      return ProviderTypeEnum.iframe;
    case HWProvider:
      return ProviderTypeEnum.ledger;
    case WalletConnectV2Provider:
      return ProviderTypeEnum.walletConnect;
    default:
      return ProviderTypeEnum.none;
  }
};
