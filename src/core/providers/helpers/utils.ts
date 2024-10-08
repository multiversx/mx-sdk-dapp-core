import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import { HWProvider } from '@multiversx/sdk-hw-provider';
import { MetamaskProvider } from '@multiversx/sdk-metamask-provider/out/metamaskProvider';
import { OperaProvider } from '@multiversx/sdk-opera-provider';
import { WalletProvider } from '@multiversx/sdk-web-wallet-provider';
import { WalletConnectV2Provider } from 'utils/walletconnect/__sdkWalletconnectProvider';
import { EmptyProvider } from './emptyProvider';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';

export const getProviderType = <TProvider extends object>(
  provider?: TProvider | null
): ProviderTypeEnum => {
  switch (provider?.constructor) {
    case WalletProvider:
      return ProviderTypeEnum.webhook;
    case WalletConnectV2Provider:
      return ProviderTypeEnum.walletConnect;
    case HWProvider:
      return ProviderTypeEnum.hardware;
    case ExtensionProvider:
      return ProviderTypeEnum.extension;
    case MetamaskProvider:
      return ProviderTypeEnum.metamask;
    case OperaProvider:
      return ProviderTypeEnum.opera;
    case CrossWindowProvider:
      return ProviderTypeEnum.crossWindow;
    case EmptyProvider:
    default:
      return ProviderTypeEnum.none;
  }
};
