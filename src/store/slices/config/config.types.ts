import { WalletConnectConfig } from 'core/providers/helpers/walletConnect/walletConnect.types';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';

export interface ConfigSliceType {
  nativeAuthConfig: NativeAuthConfigType | null;
  walletConnectConfig: WalletConnectConfig | null;
}
