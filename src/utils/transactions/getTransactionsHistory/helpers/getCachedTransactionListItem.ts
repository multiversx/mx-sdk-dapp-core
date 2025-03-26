import { ITransactionListItem } from 'lib/sdkDappCoreUi';
import { getCachedItemSelector } from 'store/selectors/cacheSelector';
import { getStore } from 'store/store';

export const getCachedTransactionListItem = (
  hash: string
): ITransactionListItem | null => {
  // Try to get from cache first
  const cachedTransaction = getCachedItemSelector<ITransactionListItem>(
    `transaction-${hash}`
  )(getStore().getState());

  if (cachedTransaction) {
    return cachedTransaction;
  }

  // If not in cache, look through session transactions for backward compatibility
  const state = getStore().getState();
  const allSessions = state.transactions;

  // Search through all sessions for the transaction
  for (const sessionId in allSessions) {
    const session = allSessions[sessionId];
    if (
      session.interpretedTransactions &&
      session.interpretedTransactions[hash]
    ) {
      return session.interpretedTransactions[hash];
    }
  }

  return null;
};
