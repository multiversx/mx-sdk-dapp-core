import { IProviderConfig } from 'core/providers/types/providerFactory.types';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';
import { getStore } from 'store/store';

export const setNativeAuthConfig = (config: NativeAuthConfigType) =>
  getStore().setState(({ config: state }) => {
    state.nativeAuthConfig = config;
  });

export const setWalletConnectConfig = (
  config: IProviderConfig['walletConnect']
) =>
  getStore().setState(({ config: state }) => {
    state.walletConnectConfig = config;
  });
