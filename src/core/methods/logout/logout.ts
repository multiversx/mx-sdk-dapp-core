import { storage } from 'storage';
import { localStorageKeys } from 'storage/local';
import { LoginMethodsEnum } from 'types';
import { getAddress } from '../account/getAddress';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { logoutAction } from 'store/actions/sharedActions/sharedActions';
import { getWebviewToken } from '../account/getWebviewToken';
import { getAccountProvider } from 'core/providers/accountProvider';
import { getProviderType } from 'core/providers/helpers/utils';

const broadcastLogoutAcrossTabs = (address: string) => {
  const storedData = storage.local?.getItem(localStorageKeys.logoutEvent);
  const { data } = storedData ? JSON.parse(storedData) : { data: address };

  if (address !== data) {
    return;
  }

  storage.local.setItem({
    key: localStorageKeys.logoutEvent,
    data: address,
    expires: 0
  });

  storage.local.removeItem(localStorageKeys.logoutEvent);
};

export type LogoutPropsType = {
  shouldAttemptReLogin?: boolean;
  shouldBroadcastLogoutAcrossTabs?: boolean;
  /*
   * Only used for web-wallet crossWindow login
   */
  hasConsentPopup?: boolean;
};

export async function logout(
  shouldAttemptReLogin = Boolean(getWebviewToken()),
  options = {
    shouldBroadcastLogoutAcrossTabs: true,
    hasConsentPopup: false
  }
) {
  let address = getAddress();
  const provider = getAccountProvider();
  const providerType = getProviderType(provider);

  if (shouldAttemptReLogin && provider?.relogin != null) {
    return provider.relogin();
  }

  if (options.shouldBroadcastLogoutAcrossTabs) {
    broadcastLogoutAcrossTabs(address);
  }

  try {
    logoutAction();

    if (
      options.hasConsentPopup &&
      providerType === LoginMethodsEnum.crossWindow
    ) {
      (provider as unknown as CrossWindowProvider).setShouldShowConsentPopup(
        true
      );
    }

    await provider.logout();
  } catch (err) {
    console.error('Logging out error:', err);
  }
}
