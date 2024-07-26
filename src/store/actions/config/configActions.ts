import { getStore } from 'store/store';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';

export const setNativeAuthConfig = (config: NativeAuthConfigType) =>
  getStore().setState(({ config: state }) => {
    state.nativeAuthConfig = config;
  });
