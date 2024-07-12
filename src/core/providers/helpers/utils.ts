import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import { HWProvider } from '@multiversx/sdk-hw-provider';
import { MetamaskProvider } from '@multiversx/sdk-metamask-provider/out/metamaskProvider';
import { OperaProvider } from '@multiversx/sdk-opera-provider';
import { CrossWindowProvider } from '@multiversx/sdk-web-wallet-cross-window-provider/out/CrossWindowProvider/CrossWindowProvider';
import { WalletProvider } from '@multiversx/sdk-web-wallet-provider';
import { LoginMethodsEnum } from 'types/enums.types';
import { WalletConnectV2Provider } from 'utils/walletconnect/__sdkWalletconnectProvider';
import { EmptyProvider } from './emptyProvider';

export const getProviderType = <TProvider extends object>(
  provider?: TProvider | null
): LoginMethodsEnum => {
  switch (provider?.constructor) {
    case WalletProvider:
      return LoginMethodsEnum.wallet;
    case WalletConnectV2Provider:
      return LoginMethodsEnum.walletconnectv2;
    case HWProvider:
      return LoginMethodsEnum.ledger;
    case ExtensionProvider:
      return LoginMethodsEnum.extension;
    case MetamaskProvider:
      return LoginMethodsEnum.metamask;
    case OperaProvider:
      return LoginMethodsEnum.opera;
    case CrossWindowProvider:
      return LoginMethodsEnum.crossWindow;
    case EmptyProvider:
      return LoginMethodsEnum.none;
    default:
      return LoginMethodsEnum.extra;
  }
};
