import { IProviderFactory, ProviderFactory } from 'core/ProviderFactory';
import { NativeAuthConfigType } from 'types/nativeAuth.types';
import { nativeAuth } from 'services/nativeAuth';
import { setAddress } from 'store/actions/account';
import { setLoginMethod, setTokenLogin } from 'store/actions/loginInfo/loginInfoActions';
import { setAccountProvider } from 'core/providers/accountProvider';

export const login = async ({
  providerConfig,
  nativeAuthConfig
}: {
  providerConfig: IProviderFactory,
  nativeAuthConfig?: NativeAuthConfigType
}) => {
  const factory = new ProviderFactory();
  const provider = await factory.create(providerConfig);

  if(!provider) {
    throw new Error('Provider not found');
  }

  await provider.init?.();

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

  setAccountProvider(provider);
  setAddress(address);
  setTokenLogin({
    loginToken,
    signature,
    nativeAuthToken,
    nativeAuthConfig
  });
  setLoginMethod(providerConfig.type);

  return {
    address,
    signature,
    nativeAuthToken,
    loginToken,
    nativeAuthConfig
  }
}