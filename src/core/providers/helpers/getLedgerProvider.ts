import { HWProvider } from '@multiversx/sdk-hw-provider';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { ledgerLoginSelector } from 'store/selectors/loginInfoSelectors';
import { getState } from 'store/store';
import { getAccountProvider } from '../accountProvider';
import { logout } from 'core/methods/logout/logout';
import { getLedgerConfiguration } from './getLedgerConfiguration';

export const getLedgerProvider = async () => {
  const isLoggedIn = getIsLoggedIn();
  const ledgerLogin = ledgerLoginSelector(getState());
  const provider = getAccountProvider();

  const initHWProvider = async () => {
    const hasAddressIndex = ledgerLogin?.index != null;

    try {
      if (provider instanceof HWProvider && provider.isInitialized()) {
        if (hasAddressIndex) {
          await provider.setAddressIndex(ledgerLogin.index);
        }

        return provider;
      }

      const ledgerProvider = new HWProvider();
      const isInitialized = await ledgerProvider.init();

      if (!isInitialized) {
        return null;
      }

      if (hasAddressIndex) {
        await ledgerProvider.setAddressIndex(ledgerLogin.index);
      }

      return ledgerProvider;
    } catch (e) {
      console.error('Failed to initialize Ledger Provider');
      return null;
    }
  };

  try {
    const ledgerProvider = await initHWProvider();

    if (!ledgerProvider) {
      console.warn('Could not initialize ledger app');

      if (isLoggedIn) {
        logout();
      }

      return null;
    }

    const ledgerConfig = await getLedgerConfiguration(ledgerProvider);
    return { ledgerProvider, ledgerConfig };
  } catch (err) {
    console.error('Could not initialize ledger app', err);

    if (isLoggedIn) {
      logout();
    }

    return null;
  }
};
