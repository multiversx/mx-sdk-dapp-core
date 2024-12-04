import { refreshAccount } from 'utils/account';
import { checkBatch } from './checkBatch';
import { TransactionsTrackerType } from '../../trackTransactions.types';
import { getPendingStoreTransactions } from '../getPendingStoreTransactions';

export async function checkTransactionStatus(
  props: TransactionsTrackerType & {
    shouldRefreshBalance?: boolean;
  }
) {
  const { pendingSessions } = getPendingStoreTransactions();
  if (Object.keys(pendingSessions).length > 0) {
    for (const [sessionId, { transactions }] of Object.entries(
      pendingSessions
    )) {
      await checkBatch({
        sessionId,
        transactionBatch: transactions,
        ...props
      });
    }
  }

  if (props.shouldRefreshBalance) {
    await refreshAccount();
  }
}
