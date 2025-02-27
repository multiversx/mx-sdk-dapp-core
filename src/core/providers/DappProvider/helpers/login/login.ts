import { registerWebsocketListener } from 'core/methods/initApp/websocket/registerWebsocket';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { nativeAuth } from 'services/nativeAuth';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';
import { logoutAction } from 'store/actions';
import { setAddress } from 'store/actions/account';
import { setTokenLogin } from 'store/actions/loginInfo/loginInfoActions';
import { nativeAuthConfigSelector } from 'store/selectors';
import { getState } from 'store/store';
import { extractAccountFromToken } from './helpers/extractAccountFromToken';

async function loginWithoutNativeToken(provider: IProvider) {
  await provider.login();

  const address = await provider.getAddress();

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

  const { address, signature, ...loginResult } = await provider.login({
    token: loginToken
  });

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

export async function login(provider: IProvider) {
  const nativeAuthConfig = nativeAuthConfigSelector(getState());

  if (nativeAuthConfig) {
    return await loginWithNativeToken(provider, nativeAuthConfig);
  }

  const data = await loginWithoutNativeToken(provider);

  await registerWebsocketListener();

  return data;
}
