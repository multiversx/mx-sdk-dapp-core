import { IProvider } from 'core/providers/types/providerFactory.types';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';
import { StorageCallback } from 'store/storage';
import { EnvironmentsEnum } from 'types/enums.types';
import { CustomNetworkType } from 'types/network.types';

type BaseDappConfigType = {
  /**
   * The native auth configuration for the dApp.
   * If set to `true`, will fallback on default configuration.
   * If set to `false`, will disable native auth.
   * If set to `NativeAuthConfigType`, will set the native auth configuration.
   */
  nativeAuth?: boolean | NativeAuthConfigType;
  /**
   * default: `true`
   */
  enableTansactionTracker?: boolean;
};

export type EnvironmentDappConfigType = BaseDappConfigType & {
  /**
   * If passed in, will automatically initialize the network with the given environment.
   */
  environment: EnvironmentsEnum;
  network?: CustomNetworkType;
};

export type CustomNetworkDappConfigType = BaseDappConfigType & {
  /**
   * Can override the network configuration, e.g. for sovereign shards.
   * Must include `apiAddress` if provided.
   */
  network: CustomNetworkType & { apiAddress: string };
  environment?: never;
};

export type DappConfigType =
  | EnvironmentDappConfigType
  | CustomNetworkDappConfigType;

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
  dAppConfig: DappConfigType;
  customProviders?: Array<{
    name: string;
    icon: string;
    class: IProvider;
  }>;
};
