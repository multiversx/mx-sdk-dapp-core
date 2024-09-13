import { refreshAccount } from 'utils/account';
import { checkBatch } from './checkBatch';
import { getPendingStoreTransactions } from '../getPendingStoreTransactions';
import { TransactionsTrackerType } from '../../trackTransactions.types';

export function checkTransactionStatus() {
  const { pendingSessions } = getPendingStoreTransactions();

  async function checkStatus(
    props: TransactionsTrackerType & {
      shouldRefreshBalance?: boolean;
    }
  ) {
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

  return checkStatus;
}
