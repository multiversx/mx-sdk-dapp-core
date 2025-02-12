import { checkBatch } from './checkBatch';
import { pendingTransactionsSessionsSelector } from 'store/selectors/transactionsSelector';
import { getState } from 'store/store';

export async function checkTransactionStatus() {
  const pendingSessions = pendingTransactionsSessionsSelector(getState());
  if (Object.keys(pendingSessions).length > 0) {
    for (const [sessionId, { transactions }] of Object.entries(
      pendingSessions
    )) {
      await checkBatch({
        sessionId,
        transactionBatch: transactions
      });
    }
  }
}
