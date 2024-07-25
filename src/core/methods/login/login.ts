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
import { tokenLoginSelector } from 'store/selectors';
import { getState } from 'store/store';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';
import { isLoggedIn } from 'utils/account/isLoggedIn';
import { getAddress } from '../../../utils/account/getAddress';

async function normalLogin(provider: IProvider) {
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

async function loginWithNativeToken(
  provider: IProvider,
  nativeAuthConfig: NativeAuthConfigType
) {
  const nativeAuthClient = nativeAuth(nativeAuthConfig);

  const loginToken = await nativeAuthClient.initialize({
    noCache: true
  });

  await provider.login({ token: loginToken });

  const address = provider.getAddress?.();
  const signature = provider.getTokenLoginSignature?.();

  if (!address) {
    throw new Error('Address not found');
  }

  if (!signature) {
    throw new Error('Signature not found');
  }

  const nativeAuthToken = nativeAuthClient.getToken({
    address,
    token: loginToken,
    signature
  });

  setAddress(address);
  setTokenLogin({
    loginToken,
    signature,
    nativeAuthToken,
    nativeAuthConfig
  });

  return {
    address,
    signature,
    nativeAuthToken,
    loginToken,
    nativeAuthConfig
  };
}

export const login = async ({
  providerConfig
}: {
  providerConfig: IProviderFactory;
}) => {
  const loggedIn = isLoggedIn();

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

  const nativeAuthConfig = tokenLoginSelector(getState())?.nativeAuthConfig;

  if (nativeAuthConfig) {
    return await loginWithNativeToken(provider, nativeAuthConfig);
  }

  return await normalLogin(provider);
};
