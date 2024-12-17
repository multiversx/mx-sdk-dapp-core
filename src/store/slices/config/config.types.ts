import { CrossWindowConfig } from 'core/providers/strategies/CrossWindowProviderStrategy/types/crossWindow.type';
import { WalletConnectConfig } from 'core/providers/strategies/WalletConnectProviderStrategy/types/walletConnect.types';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';

export interface ConfigSliceType {
  nativeAuthConfig: NativeAuthConfigType | null;
  walletConnectConfig: WalletConnectConfig | null;
  crossWindowConfig: CrossWindowConfig | null;
}
