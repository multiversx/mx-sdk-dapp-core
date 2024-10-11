import { initStore } from 'store/store';
import { defaultStorageCallback } from 'store/storage';
import { setNativeAuthConfig } from 'store/actions/config/configActions';
import { initializeNetwork } from 'store/actions';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';
import { getDefaultNativeAuthConfig } from 'services/nativeAuth/methods/getDefaultNativeAuthConfig';
import { InitAppType } from './initApp.types';
import { getIsLoggedIn } from '../account/getIsLoggedIn';
import { restoreProvider } from 'core/providers/helpers/restoreProvider';
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
  dAppConfig
}: InitAppType) {
  initStore(storage.getStorageCallback);

  const shouldEnableTransactionTracker =
    dAppConfig.enableTansactionTracker !== false;

  if (dAppConfig?.nativeAuth) {
    const nativeAuthConfig: NativeAuthConfigType =
      typeof dAppConfig.nativeAuth === 'boolean'
        ? getDefaultNativeAuthConfig()
        : dAppConfig.nativeAuth;

    setNativeAuthConfig(nativeAuthConfig);
  }

  await initializeNetwork({
    customNetworkConfig: dAppConfig.network,
    environment: dAppConfig.environment
  });

  if (shouldEnableTransactionTracker) {
    trackTransactions();
  }

  const isLoggedIn = getIsLoggedIn();

  if (isLoggedIn) {
    await restoreProvider();
    await registerWebsocketListener();
  }
}
