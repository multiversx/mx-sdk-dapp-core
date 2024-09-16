import { nativeAuth } from 'services/nativeAuth';
import { setAccount, setAddress } from 'store/actions/account';
import {
  setProviderType,
  setTokenLogin
} from 'store/actions/loginInfo/loginInfoActions';
import { setAccountProvider } from 'core/providers/accountProvider';
import {
  IProvider,
  IProviderFactory
} from 'core/providers/types/providerFactory.types';
import { ProviderFactory } from 'core/providers/ProviderFactory';
import { nativeAuthConfigSelector } from 'store/selectors';
import { getState } from 'store/store';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { getAddress } from 'core/methods/account/getAddress';
import { logoutAction } from 'store/actions';
import { extractAccountFromToken } from './helpers/extractAccountFromToken';
import { SECOND_LOGIN_ATTEMPT_ERROR } from 'constants/errorMessages.constants';
import { getCallbackUrl } from './helpers/getCallbackUrl';
import { registerWebsocketListener } from '../initApp/websocket/registerWebsocket';

async function loginWithoutNativeToken(provider: IProvider) {
  await provider.login?.({
    callbackUrl: getCallbackUrl()
  });

  const address = await provider.getAddress?.();

  if (!address) {
    throw new Error('Address not found');
  }

  setAddress(address);

  return {
    address
  };
}

async function loginWithNativeToken(
  provider: IProvider,
  nativeAuthConfig: NativeAuthConfigType
) {
  const nativeAuthClient = nativeAuth(nativeAuthConfig);

  const loginToken = await nativeAuthClient.initialize({
    noCache: true
  });

  const loginResult = await provider.login?.({
    callbackUrl: getCallbackUrl(),
    token: loginToken
  });

  const address =
    loginResult?.address ?? provider.getAddress
      ? // TODO check why on the second login the address is fetched asynchronously (looks like the crosswindow provider has getAddress as an async function)
        await provider.getAddress()
      : loginResult?.address;

  const signature =
    loginResult?.signature ?? provider.getTokenLoginSignature
      ? provider.getTokenLoginSignature()
      : loginResult?.signature;

  if (!address) {
    console.warn('Login cancelled.');
    return null;
  }

  if (!signature) {
    console.error('Failed to sign login token');
    return null;
  }

  const nativeAuthToken = nativeAuthClient.getToken({
    address,
    token: loginToken,
    signature
  });

  setTokenLogin({
    loginToken,
    signature,
    nativeAuthToken
  });

  const accountDetails = await extractAccountFromToken({
    loginToken,
    extraInfoData: {
      multisig: loginResult?.multisig,
      impersonate: loginResult?.impersonate
    },
    address,
    provider
  });

  if (!accountDetails.account) {
    logoutAction();
    console.error('Failed to fetch account');
    throw new Error('Failed to fetch account');
  }

  await registerWebsocketListener();

  return {
    address: accountDetails?.address || address,
    signature,
    nativeAuthToken,
    loginToken: accountDetails?.modifiedLoginToken || loginToken,
    nativeAuthConfig
  };
}

export const login = async ({
  providerConfig
}: {
  providerConfig: IProviderFactory;
}) => {
  const loggedIn = getIsLoggedIn();

  if (loggedIn) {
    console.warn('Already logged in with:', getAddress());
    throw new Error(SECOND_LOGIN_ATTEMPT_ERROR);
  }

  const factory = new ProviderFactory();
  const provider = await factory.create(providerConfig);

  if (!provider) {
    throw new Error('Provider not found');
  }

  await provider.init?.();
  setAccountProvider(provider);
  setProviderType(providerConfig.type);

  const nativeAuthConfig = nativeAuthConfigSelector(getState());

  if (nativeAuthConfig) {
    return await loginWithNativeToken(provider, nativeAuthConfig);
  }

  const data = await loginWithoutNativeToken(provider);

  await registerWebsocketListener();

  return data;
};
