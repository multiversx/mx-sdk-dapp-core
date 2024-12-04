import { getAddress } from 'core/methods/account/getAddress';
import { getLatestNonce } from 'core/methods/account/getLatestNonce';
import { getAccountProvider } from 'core/providers/accountProvider';
import { setAccount } from 'store/actions';
import { fetchAccount } from './fetchAccount';

const setNewAccount = async () => {
  try {
    const address = getAddress();

    try {
      const account = await fetchAccount(address);

      if (account != null) {
        const accountData = {
          ...account,
          nonce: getLatestNonce(account)
        };

        setAccount(accountData);

        return accountData;
      }
    } catch (e) {
      console.error('Failed getting account ', e);
    }
  } catch (e) {
    console.error('Failed getting address ', e);
  }

  return null;
};

export async function refreshAccount() {
  const provider = getAccountProvider();

  if (provider == null) {
    throw 'Provider not initialized';
  }

  try {
    if (!provider.init) {
      throw 'Current provider does not have init() function';
    }

    const initialized = await provider.init();

    if (!initialized) {
      return;
    }

    return setNewAccount();
  } catch (e) {
    console.error('Failed initializing provider ', e);
  }

  return undefined;
}
