import { HWProvider } from '@multiversx/sdk-hw-provider/out';
import BigNumber from 'bignumber.js';
import { ProviderErrorsEnum } from 'types';
import { fetchAccount } from 'utils/account/fetchAccount';
import { ILedgerAccount } from '../types';
import { LedgerStateManagerType } from '../types/ledgerProvider.types';

type LedgerAccountsProps = {
  manager: LedgerStateManagerType | null;
  provider: HWProvider | null;
};

export const updateLedgerAccounts = async ({
  manager,
  provider
}: LedgerAccountsProps) => {
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
