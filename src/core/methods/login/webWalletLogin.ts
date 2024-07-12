import { LoginMethodsEnum } from 'types/enums.types';
import { OnProviderLoginType } from 'types/login.types';
import { getWindowLocation } from 'utils/window/getWindowLocation';

export const webWalletLogin = ({
  token: tokenToSign,
  nativeAuth,
  hasConsentPopup,
  walletAddress
}: OnProviderLoginType & {
  hasConsentPopup?: boolean;
  walletAddress?: string;
}) => {
  const hasNativeAuth = nativeAuth != null;
  const loginService = useLoginService(nativeAuth);
  let token = tokenToSign;
  const network = useSelector(networkSelector);

  const isLoggedIn = getIsLoggedIn();

  async function initiateLogin() {
    if (isLoggedIn) {
      throw new Error(SECOND_LOGIN_ATTEMPT_ERROR);
    }

    const isSuccessfullyInitialized: boolean =
      await CrossWindowProvider.getInstance().init();
    const provider: CrossWindowProvider =
      CrossWindowProvider.getInstance().setWalletUrl(
        walletAddress ?? network.walletAddress
      );

    try {
      if (!isSuccessfullyInitialized) {
        console.warn(
          'Something went wrong trying to redirect to wallet login..'
        );
        return;
      }

      const { origin, pathname } = getWindowLocation();
      const callbackUrl: string = encodeURIComponent(`${origin}${pathname}`);

      if (hasNativeAuth && !token) {
        token = await loginService.getNativeAuthLoginToken();

        // Fetching block failed
        if (!token) {
          console.warn('Fetching block failed. Login cancelled.');
          return;
        }
      }

      if (token) {
        loginService.setLoginToken(token);
      }

      const providerLoginData = {
        callbackUrl,
        ...(token && { token })
      };

      const needsConsent = isBrowserWithPopupConfirmation && hasNativeAuth;

      if (needsConsent || hasConsentPopup) {
        provider.setShouldShowConsentPopup(true);
      }

      const { signature, address, multisig, impersonate } =
        await provider.login(providerLoginData);

      setAccountProvider(provider);

      if (!address) {
        setIsLoading(false);
        console.warn('Login cancelled.');
        return;
      }

      const account = await processModifiedAccount({
        loginToken: token,
        extraInfoData: { multisig, impersonate },
        address,
        signature,
        loginService
      });

      if (!account) {
        return;
      }

      dispatch(
        loginAction({
          address: account.address,
          loginMethod: LoginMethodsEnum.crossWindow
        })
      );

      dispatch(
        setAccount({
          ...account,
          nonce: getLatestNonce(account)
        })
      );

      optionalRedirect({
        callbackRoute,
        onLoginRedirect,
        options: { signature, address: account.address }
      });
    } catch (error) {
      console.error('error loging in', error);
      // TODO: can be any or typed error
      setError('error logging in' + (error as any).message);
    } finally {
      setIsLoading(false);
    }
  }

  const loginFailed = Boolean(error);

  return [
    initiateLogin,
    {
      loginFailed,
      error,
      isLoading: isLoading && !loginFailed,
      isLoggedIn: isLoggedIn && !loginFailed
    }
  ];
};
