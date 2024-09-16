import { HWProvider } from '@multiversx/sdk-hw-provider';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { ledgerLoginSelector } from 'store/selectors/loginInfoSelectors';
import { getState } from 'store/store';
import { getAccountProvider } from '../accountProvider';
import { logout } from 'core/methods/logout/logout';
import { getLedgerConfiguration } from './getLedgerConfiguration';

export const setLedgerProvider = async () => {
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

      const hwWalletP = new HWProvider();
      const isInitialized = await hwWalletP.init();

      if (!isInitialized) {
        return null;
      }

      if (hasAddressIndex) {
        await hwWalletP.setAddressIndex(ledgerLogin.index);
      }

      return hwWalletP;
    } catch (e) {
      console.error('Failed to initialise Ledger Provider');

      return null;
    }
  };

  let hwWalletP: HWProvider | null;

  try {
    hwWalletP = await initHWProvider();

    if (!hwWalletP) {
      console.warn('Could not initialise ledger app');

      if (isLoggedIn) {
        logout();
      }

      return;
    }

    const ledgerConfig = await getLedgerConfiguration(hwWalletP);
    return { hwWalletP, ledgerConfig };
  } catch (err) {
    console.error('Could not initialise ledger app', err);

    if (isLoggedIn) {
      logout();
    }
  }
};
