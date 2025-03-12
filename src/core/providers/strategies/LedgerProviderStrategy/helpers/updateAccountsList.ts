import { HWProvider } from '@multiversx/sdk-hw-provider/out';
import BigNumber from 'bignumber.js';
import { ProviderErrorsEnum } from 'types';
import { fetchAccount } from 'utils/account/fetchAccount';
import { ILedgerAccount } from '../types';
import { LedgerConnectStateManagerType } from '../types/ledgerProvider.types';

type AccountsListType = {
  manager: LedgerConnectStateManagerType | null;
  provider: HWProvider | null;
};

/**
 * Updates the list of accounts and fetches their balances.
 *
 * This function performs the following steps:
 * 1. Checks if the manager and provider are initialized; if not, throws an error.
 * 2. Retrieves the starting index for pagination and the current list of accounts.
 * 3. Checks if there is already data for the current page to avoid unnecessary fetching.
 * 4. If no data is present, it fetches the accounts from the wallet provider.
 * 5. Updates the state manager with the new account data and their balances.
 * 6. Handles errors by reverting to existing accounts and logging the error.
 */
export const updateAccountsList = async ({
  manager,
  provider
}: AccountsListType) => {
  if (!manager || !provider) {
    throw new Error(ProviderErrorsEnum.notInitialized);
  }

  const startIndex = manager.getAccountScreenData()?.startIndex || 0;
  const allAccounts = manager.getAllAccounts();

  const hasData = allAccounts.some(
    ({ index, balance }) =>
      index === startIndex && new BigNumber(balance).isFinite()
  );

  const slicedAccounts = allAccounts.slice(
    startIndex,
    startIndex + manager.addressesPerPage
  );

  if (hasData) {
    return manager.updateAccountScreen({
      accounts: slicedAccounts,
      isLoading: false
    });
  }

  if (slicedAccounts.length === 0) {
    manager.updateAccountScreen({
      isLoading: true
    });
  }

  try {
    const accountsArray = await provider.getAccounts(
      startIndex,
      manager.addressesPerPage
    );

    const accountsWithBalance: ILedgerAccount[] = accountsArray.map(
      (address, index) => {
        return {
          address,
          balance: '...',
          index: index + startIndex
        };
      }
    );

    const newAllAccounts = [...allAccounts, ...accountsWithBalance];

    manager.updateAllAccounts(newAllAccounts);

    manager.updateAccountScreen({
      accounts: newAllAccounts.slice(
        startIndex,
        startIndex + manager.addressesPerPage
      ),
      isLoading: false
    });

    const balancePromises = accountsArray.map((address) =>
      fetchAccount(address)
    );

    const balances = await Promise.all(balancePromises);

    balances.forEach((account, index) => {
      const bNbalance = new BigNumber(String(account?.balance));
      if (!account || bNbalance.isNaN()) {
        return;
      }
      const balance = bNbalance
        .dividedBy(BigNumber(10).pow(18))
        .toFormat(4)
        .toString();
      const accountArrayIndex = index + startIndex;
      newAllAccounts[accountArrayIndex].balance = balance;
    });

    manager.updateAllAccounts(newAllAccounts);

    manager.updateAccountScreen({
      accounts: newAllAccounts.slice(
        startIndex,
        startIndex + manager.addressesPerPage
      )
    });
  } catch (error) {
    manager.updateAccountScreen({
      accounts: allAccounts.slice(
        startIndex,
        startIndex + manager.addressesPerPage
      ),
      isLoading: false
    });
    console.error('Failed to fetch accounts:', error);
  }
};
