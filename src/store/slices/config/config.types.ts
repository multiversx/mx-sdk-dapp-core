import { CrossWindowConfig } from 'core/providers/helpers/crossWindow/crossWindow.type';
import { WalletConnectConfig } from 'core/providers/helpers/walletConnect/walletConnect.types';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';

export interface ConfigSliceType {
  nativeAuthConfig: NativeAuthConfigType | null;
  walletConnectConfig: WalletConnectConfig | null;
  crossWindowConfig: CrossWindowConfig | null;
}
