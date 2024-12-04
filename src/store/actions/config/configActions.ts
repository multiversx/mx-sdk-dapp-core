import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';
import { getStore } from 'store/store';

export const setNativeAuthConfig = (config: NativeAuthConfigType) =>
  getStore().setState(({ config: state }) => {
    state.nativeAuthConfig = config;
  });
