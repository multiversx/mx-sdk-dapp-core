import { HWProvider } from '@multiversx/sdk-hw-provider';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { ledgerLoginSelector } from 'store/selectors/loginInfoSelectors';
import { getState } from 'store/store';
import { getLedgerConfiguration } from './getLedgerConfiguration';
import { getAccountProvider } from '../../../accountProvider';

export async function getLedgerProvider() {
  const isLoggedIn = getIsLoggedIn();
  const ledgerLogin = ledgerLoginSelector(getState());
  const provider = getAccountProvider();

  const initHWProvider = async () => {
    const hasAddressIndex = ledgerLogin?.index != null;

    if (provider instanceof HWProvider && provider.isInitialized()) {
      if (hasAddressIndex) {
        await provider.setAddressIndex(ledgerLogin.index);
      }

      return provider;
    }

    const ledgerProvider = new HWProvider();
    const isInitialized = await ledgerProvider.init();

    if (!isInitialized) {
      throw new Error('Failed to initialize Ledger Provider');
    }

    if (hasAddressIndex) {
      await ledgerProvider.setAddressIndex(ledgerLogin.index);
    }

    return ledgerProvider;
  };

  try {
    const ledgerProvider = await initHWProvider();
    const ledgerConfig = await getLedgerConfiguration(ledgerProvider);
    return { ledgerProvider, ledgerConfig };
  } catch (err) {
    console.error('Could not initialize ledger app', err);

    if (isLoggedIn) {
      await provider.logout();
    }

    throw err;
  }
}
