import { safeWindow } from 'constants/index';
import { PendingTransactionsStateManager } from 'core/managers/internal/PendingTransactionsStateManager/PendingTransactionsStateManager';
import { SignTransactionsStateManager } from 'core/managers/internal/SignTransactionsStateManager/SignTransactionsStateManager';
import { ToastManager } from 'core/managers/internal/ToastManager/ToastManager';
import { login } from 'core/providers/DappProvider/helpers/login/login';
import { restoreProvider } from 'core/providers/helpers/restoreProvider';
import { ProviderFactory } from 'core/providers/ProviderFactory';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
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
import { getIsInIframe } from 'utils/window/getIsInIframe';
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

  const isInIframe = getIsInIframe();
  const isLoggedIn = getIsLoggedIn();

  if (isInIframe && !isLoggedIn) {
    const provider = await ProviderFactory.create({
      type: ProviderTypeEnum.webview
    });

    await login(provider.getProvider());
  }

  const toastManager = new ToastManager({
    successfulToastLifetime: dAppConfig.successfulToastLifetime
  });

  toastManager.init();

  const pendingTransactionsStateManager =
    PendingTransactionsStateManager.getInstance();
  await pendingTransactionsStateManager.init();

  const signTransactionsStateManager =
    SignTransactionsStateManager.getInstance();
  await signTransactionsStateManager.init();

  const usedProviders = [
    ...((safeWindow as any)?.multiversx?.providers || []),
    ...(customProviders || [])
  ];

  ProviderFactory.customProviders(usedProviders || []);

  if (isLoggedIn) {
    await restoreProvider();
    await registerWebsocketListener();
    trackTransactions();
  }
}
