import { Address, SignableMessage } from '@multiversx/sdk-core';
import { nativeAuth } from 'services/nativeAuth';
import { buildNativeAuthConfig } from 'services/nativeAuth/methods';
import { networkSelector, tokenLoginSelector } from 'store/selectors';
import { getState } from 'store/store';
import { OnProviderLoginType } from 'types/login.types';
import { getAccount } from '../../account/getAccount';
import { setTokenLogin } from 'store/actions/loginInfo/loginInfoActions';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';

const getApiAddress = (
  apiAddress: string,
  config?: OnProviderLoginType['nativeAuth']
) => {
  if (!config) {
    return null;
  }
  if (config === true) {
    return apiAddress;
  }
  return config.apiAddress ?? apiAddress;
};

export const getLoginService = (config?: OnProviderLoginType['nativeAuth']) => {
  const network = networkSelector(getState());

  const tokenLogin = tokenLoginSelector(getState());
  let tokenRef = tokenLogin?.loginToken;

  const apiAddress = getApiAddress(network.apiAddress, config);

  const configuration = buildNativeAuthConfig({
    ...(config === true ? {} : config),
    ...(apiAddress ? { apiAddress } : {})
  });

  const hasNativeAuth = Boolean(config);

  const client = nativeAuth(configuration);

  const setLoginToken = (loginToken: string) => {
    tokenRef = loginToken;

    setTokenLogin({
      ...tokenLogin,
      loginToken,
      ...(apiAddress ? { nativeAuthConfig: configuration } : {})
    });
  };

  const getNativeAuthLoginToken = () => {
    try {
      return client.initialize();
    } catch (error) {
      console.error('Unable to get block. Login failed.', error);
      return;
    }
  };

  const setTokenLoginInfo = ({
    address,
    signature
  }: {
    address: string;
    signature: string;
  }) => {
    const loginToken = tokenRef;

    if (!loginToken) {
      throw 'Token not found. Call `setLoginToken` first.';
    }

    if (!hasNativeAuth) {
      setTokenLogin({
        loginToken,
        signature
      });

      return;
    }

    const nativeAuthToken = client.getToken({
      address,
      token: loginToken,
      signature
    });

    setTokenLogin({
      loginToken,
      signature,
      nativeAuthToken,
      ...(apiAddress ? { nativeAuthConfig: configuration } : {})
    });
    return nativeAuthToken;
  };

  const refreshNativeAuthTokenLogin = async ({
    signMessageCallback,
    nativeAuthClientConfig
  }: {
    signMessageCallback: (
      messageToSign: SignableMessage,
      options: Record<any, any>
    ) => Promise<SignableMessage>;
    nativeAuthClientConfig?: NativeAuthConfigType;
  }) => {
    const { address } = getAccount();

    const nativeAuthClient = nativeAuth(
      nativeAuthClientConfig || configuration
    );

    const loginToken = await nativeAuthClient.initialize({
      noCache: Boolean(nativeAuthClientConfig)
    });

    tokenRef = loginToken;
    if (!loginToken) {
      return;
    }
    const messageToSign = new SignableMessage({
      address: new Address(address),
      message: Buffer.from(`${address}${loginToken}`)
    });
    const signedMessage = await signMessageCallback(messageToSign, {});
    const nativeAuthToken = setTokenLoginInfo({
      address,
      signature: signedMessage.getSignature().toString('hex')
    });

    return nativeAuthToken;
  };

  return {
    configuration,
    setLoginToken,
    getNativeAuthLoginToken,
    setTokenLoginInfo,
    refreshNativeAuthTokenLogin
  };
};
