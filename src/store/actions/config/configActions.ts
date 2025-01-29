import { CrossWindowConfig } from 'core/providers/strategies/CrossWindowProviderStrategy/types';
import { WalletConnectConfig } from 'core/providers/strategies/WalletConnectProviderStrategy/types';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';
import { getStore } from 'store/store';

export const setNativeAuthConfig = (config: NativeAuthConfigType) =>
  getStore().setState(({ config: state }) => {
    state.nativeAuthConfig = config;
  });

export const setWalletConnectConfig = (config: WalletConnectConfig) =>
  getStore().setState(
    ({ config: state }) => {
      state.walletConnectConfig = config;
    },
    false,
    'setWalletConnectConfig'
  );

export const setCrossWindowConfig = (config: CrossWindowConfig) =>
  getStore().setState(
    ({ config: state }) => {
      state.crossWindowConfig = config;
    },
    false,
    'setCrossWindowConfig'
  );
