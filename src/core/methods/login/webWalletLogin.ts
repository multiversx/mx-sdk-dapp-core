import { OnProviderLoginType } from 'types/login.types';
import { getWindowLocation } from 'utils/window/getWindowLocation';
import { getLoginService } from './helpers/getLoginService';
import { networkSelector } from 'store/selectors';
import { getState } from 'store/store';
import { getIsLoggedIn } from '../account/getIsLoggedIn';
import { setAccountProvider } from 'core/providers/accountProvider';
import { SECOND_LOGIN_ATTEMPT_ERROR } from 'constants/errorMessages.constants';
import { isBrowserWithPopupConfirmation } from 'constants/browser.constants';
import { processModifiedAccount } from './helpers/processModifiedAccount';
import { loginAction } from 'store/actions/sharedActions';
import { setAccount } from 'store/actions/account/accountActions';
import { getLatestNonce } from 'utils/account/getLatestNonce';
import { AccountType } from 'types/account.types';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { ProviderTypeEnum } from '../../providers/types/providerFactory.types';

export const webWalletLogin = async ({
  token: tokenToSign,
  nativeAuth,
  hasConsentPopup,
  walletAddress
}: OnProviderLoginType & {
  hasConsentPopup?: boolean;
  walletAddress?: string;
}): Promise<AccountType | null> => {
  const hasNativeAuth = nativeAuth != null;
  const loginService = getLoginService(nativeAuth);
  let token = tokenToSign;
  const network = networkSelector(getState());

  const isLoggedIn = getIsLoggedIn();

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
      console.warn('Something went wrong trying to redirect to wallet login..');
      return null;
    }

    const { origin, pathname } = getWindowLocation();
    const callbackUrl: string = encodeURIComponent(`${origin}${pathname}`);

    if (hasNativeAuth && !token) {
      token = await loginService.getNativeAuthLoginToken();

      // Fetching block failed
      if (!token) {
        console.warn('Fetching block failed. Login cancelled.');
        return null;
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
      console.warn('Login cancelled.');
      return null;
    }

    const account = await processModifiedAccount({
      loginToken: token,
      extraInfoData: { multisig, impersonate },
      address,
      signature,
      loginService
    });

    if (!account) {
      return null;
    }

    loginAction({
      address: account.address,
      providerType: ProviderTypeEnum.crossWindow
    });

    const newAccount: AccountType = {
      ...account,
      nonce: getLatestNonce(account)
    };

    setAccount(newAccount);

    return newAccount;
  } catch (error) {
    console.error('error logging in', error);
    throw error;
  }
};
