import { decodeNativeAuthToken } from 'services/nativeAuth/helpers';
import { setTokenLogin } from 'store/actions/loginInfo/loginInfoActions';
import { loginAction } from 'store/actions/sharedActions/sharedActions';
import { LoginMethodsEnum } from 'types';

export function loginWithNativeAuthToken(token: string) {
  const nativeAuthInfo = decodeNativeAuthToken(token);

  if (nativeAuthInfo == null) {
    return;
  }

  const { signature, address } = nativeAuthInfo;

  if (signature && token && address) {
    setTokenLogin({
      loginToken: token,
      signature,
      nativeAuthToken: token
    });

    loginAction({ address, loginMethod: LoginMethodsEnum.extra });
  }
}
