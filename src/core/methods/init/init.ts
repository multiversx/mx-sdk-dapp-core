import { initStore } from 'store/store';
import { defaultStorageCallback, StorageCallback } from 'store/storage';
import { setTokenLoginNativeAuthTokenConfig } from 'store/actions/loginInfo/loginInfoActions';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';
import { getDefaultNativeAuthConfig } from 'services/nativeAuth/methods/getDefaultNativeAuthConfig';

type InitAppType = {
  storage?: {
    getStorageCallback: StorageCallback;
  };
  nativeAuth?: boolean | NativeAuthConfigType;
};
const defaultInitAppProps = {
  storage: {
    getStorageCallback: defaultStorageCallback
  }
};
export const initializeDApp = (props?: InitAppType) => {
  const { storage, nativeAuth } = { ...defaultInitAppProps, ...props };
  initStore(storage.getStorageCallback);

  if (nativeAuth) {
    const nativeAuthConfig: NativeAuthConfigType =
      typeof nativeAuth === 'boolean'
        ? getDefaultNativeAuthConfig()
        : nativeAuth;

    setTokenLoginNativeAuthTokenConfig(nativeAuthConfig);
  }
};
