import {
  IProvider,
  ProviderTypeEnum
} from 'core/providers/types/providerFactory.types';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { logoutAction } from 'store/actions/sharedActions/sharedActions';

export type LogoutPropsType = {
  shouldAttemptReLogin?: boolean;
  /*
   * Only used for web-wallet crossWindow login
   */
  hasConsentPopup?: boolean;
};

interface IProviderLogout {
  provider: IProvider;
  options?: LogoutPropsType;
}

export async function logout({
  provider,
  options = {
    hasConsentPopup: false
  }
}: IProviderLogout) {
  try {
    logoutAction();

    if (
      options.hasConsentPopup &&
      provider.getType() === ProviderTypeEnum.crossWindow
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
