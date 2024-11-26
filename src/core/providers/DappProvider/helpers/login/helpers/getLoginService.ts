import { Address, Message } from '@multiversx/sdk-core';
import { getAccount } from 'core/methods/account/getAccount';
import { nativeAuth } from 'services/nativeAuth';
import { buildNativeAuthConfig } from 'services/nativeAuth/methods';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';
import { setTokenLogin } from 'store/actions/loginInfo/loginInfoActions';
import { networkSelector, tokenLoginSelector } from 'store/selectors';
import { getState } from 'store/store';
import { OnProviderLoginType } from 'types/login.types';

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

export function getLoginService(config?: OnProviderLoginType['nativeAuth']) {
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
      messageToSign: Message,
      options: Record<any, any>
    ) => Promise<Message>;
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

    const messageToSign = new Message({
      address: new Address(address),
      data: Buffer.from(`${address}${loginToken}`)
    });

    const signedMessage = await signMessageCallback(messageToSign, {});

    if (!signedMessage?.signature) {
      throw 'Message not signed';
    }

    const nativeAuthToken = setTokenLoginInfo({
      address,
      signature: Buffer.from(signedMessage.signature).toString('hex')
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
}
