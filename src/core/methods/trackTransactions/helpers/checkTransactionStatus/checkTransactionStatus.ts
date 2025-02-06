import { refreshAccount } from 'utils/account';
import { checkBatch } from './checkBatch';
import { TransactionsTrackerType } from '../../trackTransactions.types';
import { pendingTransactionsSessionsSelector } from 'store/selectors/transactionsSelector';
import { getState } from 'store/store';

export async function checkTransactionStatus(
  props: TransactionsTrackerType & {
    shouldRefreshBalance?: boolean;
  }
) {
  const pendingSessions = pendingTransactionsSessionsSelector(getState());
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
