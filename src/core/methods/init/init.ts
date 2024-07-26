import { initStore } from 'store/store';
import { defaultStorageCallback, StorageCallback } from 'store/storage';
import { setNativeAuthConfig } from 'store/actions/config/configActions';
import { initializeNetwork } from 'store/actions';
import { CustomNetworkType } from 'types/network.types';
import { EnvironmentsEnum } from 'types/enums.types';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';
import { getDefaultNativeAuthConfig } from 'services/nativeAuth/methods/getDefaultNativeAuthConfig';

type InitAppType = {
  storage?: {
    getStorageCallback: StorageCallback;
  };
  dAppConfig?: {
    nativeAuth?: boolean | NativeAuthConfigType;
    network?: CustomNetworkType;
    environment?: EnvironmentsEnum;
  };
};
const defaultInitAppProps = {
  storage: {
    getStorageCallback: defaultStorageCallback
  }
};

/**
 * Initializes the dApp with the given configuration.
 * @param props - The configuration for the dApp initialization.
 * @param props.storage - The storage configuration for the dApp.
 * @param props.storage.getStorageCallback - The callback to get the storage (custom storage).
 * @param props.nativeAuth - The native auth configuration for the dApp.
 * @param props.nativeAuth - If set to `true`, will fallback on default configuration.
 * @param props.nativeAuth - If set to `false`, will disable native auth.
 * @param props.nativeAuth - If set to `NativeAuthConfigType`, will set the native auth configuration.
 *
 * !!! Avoid changing the configuration during the dApp lifecycle.
 *
 * @example
 * ```ts
 * initializeDApp({
 *  nativeAuth: true
 *  });
 *  ```
 * */
export const initializeDApp = async (props?: InitAppType) => {
  const { storage, dAppConfig } = { ...defaultInitAppProps, ...props };
  initStore(storage.getStorageCallback);

  if (dAppConfig?.nativeAuth) {
    const nativeAuthConfig: NativeAuthConfigType =
      typeof dAppConfig.nativeAuth === 'boolean'
        ? getDefaultNativeAuthConfig()
        : dAppConfig.nativeAuth;

    setNativeAuthConfig(nativeAuthConfig);
  }

  if (dAppConfig?.network) {
    await initializeNetwork({
      customNetworkConfig: dAppConfig.network,
      environment: dAppConfig.environment ?? EnvironmentsEnum.devnet
    });
  }
};
