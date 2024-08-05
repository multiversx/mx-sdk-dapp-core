import { nativeAuth } from 'services/nativeAuth';
import { setAccount } from 'store/actions/account';
import { setTokenLogin } from 'store/actions/loginInfo/loginInfoActions';
import { IProvider } from 'core/providers/types/providerFactory.types';

import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';

import { loginAction, logoutAction } from 'store/actions';
import { impersonateAccount } from './impersonateAccount';
import { getCallbackUrl } from './getCallbackUrl';

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

export async function loginWithNativeToken(
  provider: IProvider,
  nativeAuthConfig: NativeAuthConfigType
) {
  const nativeAuthClient = nativeAuth(nativeAuthConfig);

  const loginToken = await nativeAuthClient.initialize({
    noCache: true
  });

  const loginResult = await provider.login({
    callbackUrl: getCallbackUrl(),
    token: loginToken
  });

  const address = provider.getAddress
    ? // TODO check why on the second login the address is fetched asynchronously (looks like the crosswindow provider has getAddress as an async function)
      await provider.getAddress()
    : loginResult.address;
  const signature = provider.getTokenLoginSignature
    ? provider.getTokenLoginSignature()
    : loginResult.signature;

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

  if (impersonationDetails.account) {
    setAccount(impersonationDetails.account);
  } else {
    logoutAction();
    console.error('Failed to fetch account');
    throw new Error('Failed to fetch account');
  }

  return {
    address: impersonationDetails?.address || address,
    signature,
    nativeAuthToken,
    loginToken: impersonationDetails?.modifiedLoginToken || loginToken,
    nativeAuthConfig
  };
}
