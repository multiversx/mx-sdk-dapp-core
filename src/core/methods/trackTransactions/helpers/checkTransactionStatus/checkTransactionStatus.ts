import { refreshAccount } from 'utils/account';
import { checkBatch } from './checkBatch';
import { TransactionsTrackerType } from '../../trackTransactions.types';
import { getPendingStoreTrackedTransactions } from '../getPendingStoreTrackedTransactions';

export async function checkTransactionStatus(
  props: TransactionsTrackerType & {
    shouldRefreshBalance?: boolean;
  }
) {
  const { pendingTrackedSessions: pendingSessions } =
    getPendingStoreTrackedTransactions();
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
