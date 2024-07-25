import { nativeAuth } from 'services/nativeAuth';
import { setAddress } from 'store/actions/account';
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
import { loginAction } from 'store/actions';
import { impersonateAccount } from './helpers/impersonateAccount';

async function loginWithoutNativeToken(provider: IProvider) {
  await provider.login();

  const address = provider.getAddress?.();

  if (!address) {
    throw new Error('Address not found');
  }

  setAddress(address);

  return {
    address
  };
}

async function tryImpersonateAccount({
  loginToken,
  extraInfoData,
  address,
  provider
}: {
  loginToken: string;
  extraInfoData: {
    multisig?: string;
    impersonate?: string;
  };
  address: string;
  provider: IProvider;
}) {
  return await impersonateAccount({
    loginToken,
    extraInfoData,
    address,
    provider
  });
}

async function loginWithNativeToken(
  provider: IProvider,
  nativeAuthConfig: NativeAuthConfigType
) {
  const nativeAuthClient = nativeAuth(nativeAuthConfig);

  const loginToken = await nativeAuthClient.initialize({
    noCache: true
  });

  const loginResult = await provider.login({ token: loginToken });

  const address = provider.getAddress?.();
  const signature = provider.getTokenLoginSignature?.();

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
    nativeAuthToken,
    nativeAuthConfig
  });
  loginAction({
    address,
    providerType: provider.getType()
  });

  const impersonationDetails = await tryImpersonateAccount({
    loginToken,
    extraInfoData: {
      multisig: loginResult.multisig,
      impersonate: loginResult.impersonate
    },
    address,
    provider
  });

  return {
    address: impersonationDetails?.address || address,
    signature,
    nativeAuthToken,
    loginToken: impersonationDetails?.modifiedLoginToken || loginToken,
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
    return;
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

  return await loginWithoutNativeToken(provider);
};
