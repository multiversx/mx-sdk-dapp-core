import { WalletConnectConfig } from 'core/providers/helpers/walletConnect/walletConnect.types';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';
import { getStore } from 'store/store';

export const setNativeAuthConfig = (config: NativeAuthConfigType) =>
  getStore().setState(({ config: state }) => {
    state.nativeAuthConfig = config;
  });

export const setWalletConnectConfig = (config: WalletConnectConfig) =>
  getStore().setState(({ config: state }) => {
    state.walletConnectConfig = config;
  });
