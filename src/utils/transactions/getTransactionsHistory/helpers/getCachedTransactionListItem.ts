import { ITransactionListItem } from 'lib/sdkDappCoreUi';
import { interpretedTransactionsSelector } from 'store/selectors/transactionsSelector';
import { getStore } from 'store/store';

export const getCachedTransactionListItem = (
  hash: string
): ITransactionListItem | null => {
  const interpretedTransactions = interpretedTransactionsSelector(
    getStore().getState()
  );

  return interpretedTransactions[hash] ?? null;
};
