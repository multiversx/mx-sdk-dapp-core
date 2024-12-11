import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { IProviderConfig } from 'core/providers/types/providerFactory.types';
import { logoutAction } from 'store/actions';
import { nativeAuthConfigSelector } from 'store/selectors';
import { chainIdSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';
import {
  WalletConnectV2Provider,
  WalletConnectOptionalMethodsEnum,
  type SessionEventTypes
} from 'utils/walletconnect/__sdkWalletconnectProvider';
import { getAccountProvider } from '../../../accountProvider';
import { WalletConnectV2Error } from '../walletConnect.types';

const dappMethods: string[] = [
  WalletConnectOptionalMethodsEnum.CANCEL_ACTION,
  WalletConnectOptionalMethodsEnum.SIGN_LOGIN_TOKEN
];

export async function getWalletConnectProvider(
  config: IProviderConfig['walletConnect']
) {
  const isLoggedIn = getIsLoggedIn();
  const chainId = chainIdSelector(getState());
  const provider = getAccountProvider();
  const nativeAuthConfig = nativeAuthConfigSelector(getState());

  if (nativeAuthConfig) {
    dappMethods.push(WalletConnectOptionalMethodsEnum.SIGN_NATIVE_AUTH_TOKEN);
  }

  if (!config?.walletConnectV2ProjectId) {
    throw new Error(WalletConnectV2Error.invalidConfig);
  }

  const handleOnLogin = () => {};

  const handleOnLogout = async () => {
    if (config.onLogout) {
      await config.onLogout();
    }

    logoutAction();
  };

  const handleOnEvent = (_event: SessionEventTypes['event']) => {};

  const providerHandlers = {
    onClientLogin: handleOnLogin,
    onClientLogout: handleOnLogout,
    onClientEvent: handleOnEvent
  };

  try {
    const {
      walletConnectV2ProjectId,
      walletConnectV2Options = {},
      walletConnectV2RelayAddress = ''
    } = config;
    const walletConnectProvider = new WalletConnectV2Provider(
      providerHandlers,
      chainId,
      walletConnectV2RelayAddress,
      walletConnectV2ProjectId,
      walletConnectV2Options
    );

    await walletConnectProvider.init();

    return { walletConnectProvider, dappMethods };
  } catch (err) {
    console.error('Could not initialize walletConnect', err);

    if (isLoggedIn) {
      await provider.logout();
    }

    throw err;
  }
}
