import { initStore } from 'store/store';
import { defaultStorageCallback, StorageCallback } from 'store/storage';
import { setNativeAuthConfig } from 'store/actions/config/configActions';
import { initializeNetwork } from 'store/actions';
import { CustomNetworkType } from 'types/network.types';
import { EnvironmentsEnum } from 'types/enums.types';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';
import { getDefaultNativeAuthConfig } from 'services/nativeAuth/methods/getDefaultNativeAuthConfig';

export type InitAppType = {
  /**
   * The storage configuration for the dApp.
   */
  storage?: {
    /**
     * The callback to get the storage (custom storage).
     */
    getStorageCallback: StorageCallback;
  };
  dAppConfig?: {
    /**
     * The native auth configuration for the dApp.
     * If set to `true`, will fallback on default configuration.
     * If set to `false`, will disable native auth.
     * If set to `NativeAuthConfigType`, will set the native auth configuration.
     */
    nativeAuth?: boolean | NativeAuthConfigType;
    /**
     * Can override the network configuration, e.g. for sovereign shards.
     */
    network?: CustomNetworkType;
    /**
     * If passed in, will automatically initialize the network with the given environment.
     */
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
 *
 * @example
 * ```ts
   initApp({
      nativeAuth: true
   });
 *  ```
 * */
export const initApp = async (props?: InitAppType) => {
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
      environment: dAppConfig.environment
    });
  }
};
