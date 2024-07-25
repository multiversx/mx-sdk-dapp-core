import { IProvider, IProviderFactory, ProviderFactory } from 'core/ProviderFactory';
import { NativeAuthConfigType } from 'types/nativeAuth.types';
import { nativeAuth } from 'services/nativeAuth';
import { setAddress } from 'store/actions/account';
import { setLoginMethod, setTokenLogin } from 'store/actions/loginInfo/loginInfoActions';
import { setAccountProvider } from 'core/providers/accountProvider';
import { getNativeAuthConfig } from 'services/nativeAuth/methods';

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

async function loginWithNativeToken(provider: IProvider, nativeAuthConfig: NativeAuthConfigType) {
  const nativeAuthClient =  nativeAuth(nativeAuthConfig);

  const loginToken = await nativeAuthClient.initialize({
    noCache: true
  });

  await provider.login({ token: loginToken });

  const address = provider.getAddress?.();
  const signature = provider.getTokenLoginSignature?.();

  if(!address) {
    throw new Error('Address not found');
  }

  if(!signature) {
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
  }
}

export const login = async ({
  providerConfig,
  withNativeAuth
}: {
  providerConfig: IProviderFactory,
  withNativeAuth?: boolean | NativeAuthConfigType,
}) => {
  const factory = new ProviderFactory();
  const provider = await factory.create(providerConfig);

  if(!provider) {
    throw new Error('Provider not found');
  }

  await provider.init?.();
  setAccountProvider(provider);
  setLoginMethod(providerConfig.type);

  if(withNativeAuth) {
    if(typeof withNativeAuth === 'boolean') {
      withNativeAuth = getNativeAuthConfig(true);
    }

    const nativeAuthConfig = withNativeAuth as NativeAuthConfigType;

    return await loginWithNativeToken(provider, nativeAuthConfig);
  } else {
    return await normalLogin(provider);
  }
}