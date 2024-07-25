import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import { HWProvider } from '@multiversx/sdk-hw-provider';
import { MetamaskProvider } from '@multiversx/sdk-metamask-provider/out/metamaskProvider';
import { OperaProvider } from '@multiversx/sdk-opera-provider';
import { WalletProvider } from '@multiversx/sdk-web-wallet-provider';
import { LoginMethodsType, LoginMethodsEnum } from 'types/enums.types';
import { WalletConnectV2Provider } from 'utils/walletconnect/__sdkWalletconnectProvider';
import { EmptyProvider } from './emptyProvider';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';

export const getProviderType = <TProvider extends object>(
  provider?: TProvider | null
): LoginMethodsType => {
  switch (provider?.constructor) {
    case WalletProvider:
      return LoginMethodsEnum.webhook;
    case WalletConnectV2Provider:
      return LoginMethodsEnum.walletConnect;
    case HWProvider:
      return LoginMethodsEnum.hardware;
    case ExtensionProvider:
      return LoginMethodsEnum.extension;
    case MetamaskProvider:
      return LoginMethodsEnum.metamask;
    case OperaProvider:
      return LoginMethodsEnum.opera;
    case CrossWindowProvider:
      return LoginMethodsEnum.crossWindow;
    case EmptyProvider:
    default:
      return LoginMethodsEnum.none;
  }
};
