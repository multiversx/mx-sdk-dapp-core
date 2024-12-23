import { safeWindow } from 'constants/index';
import { ToastManager } from 'core/managers/ToastManager/ToastManager';
import { restoreProvider } from 'core/providers/helpers/restoreProvider';
import { ProviderFactory } from 'core/providers/ProviderFactory';
import { getDefaultNativeAuthConfig } from 'services/nativeAuth/methods/getDefaultNativeAuthConfig';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';
import { initializeNetwork } from 'store/actions';
import {
  setCrossWindowConfig,
  setNativeAuthConfig,
  setWalletConnectConfig
} from 'store/actions/config/configActions';
import { defaultStorageCallback } from 'store/storage';
import { initStore } from 'store/store';
import { InitAppType } from './initApp.types';
import { getIsLoggedIn } from '../account/getIsLoggedIn';
import { registerWebsocketListener } from './websocket/registerWebsocket';
import { trackTransactions } from '../trackTransactions/trackTransactions';

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
      nativeAuth: true,
      environment: EnvironmentsEnum.devnet
   });
 *  ```
 * */
export async function initApp({
  storage = defaultInitAppProps.storage,
  dAppConfig,
  customProviders
}: InitAppType) {
  initStore(storage.getStorageCallback);

  const { apiAddress } = await initializeNetwork({
    customNetworkConfig: dAppConfig.network,
    environment: dAppConfig.environment
  });

  if (dAppConfig?.nativeAuth) {
    const nativeAuthConfig: NativeAuthConfigType =
      typeof dAppConfig.nativeAuth === 'boolean'
        ? getDefaultNativeAuthConfig(apiAddress)
        : dAppConfig.nativeAuth;

    setNativeAuthConfig(nativeAuthConfig);
  }

  if (dAppConfig?.providers?.walletConnect) {
    setWalletConnectConfig(dAppConfig.providers.walletConnect);
  }

  if (dAppConfig?.providers?.crossWindow) {
    setCrossWindowConfig(dAppConfig.providers.crossWindow);
  }

  trackTransactions();
  const toastManager = new ToastManager();
  toastManager.init();

  const isLoggedIn = getIsLoggedIn();

  const usedProviders = [
    ...((safeWindow as any)?.multiversx?.providers || []),
    ...(customProviders || [])
  ];

  ProviderFactory.customProviders(usedProviders || []);

  if (isLoggedIn) {
    await restoreProvider();
    await registerWebsocketListener();
  }
}
