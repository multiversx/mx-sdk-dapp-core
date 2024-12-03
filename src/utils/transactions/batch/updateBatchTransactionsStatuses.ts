import {
  ServerTransactionType,
  SignedTransactionType,
  TransactionServerStatusesEnum
} from 'types';
import { sequentialToFlatArray } from './sequentialToFlatArray';

export function updateBatchTransactionsStatuses({
  batchId,
  sessionId,
  transactions
}: {
  batchId: string;
  sessionId: string;
  transactions: SignedTransactionType[] | SignedTransactionType[][];
}) {
  const transactionsArray = sequentialToFlatArray<SignedTransactionType>({
    transactions
  });

  const batchIsSuccessful = transactionsArray.every(
    (transaction) =>
      transaction.status === TransactionServerStatusesEnum.success
  );

  if (transactionsArray.length === 0) {
    return;
  }

  for (const transaction of transactionsArray) {
    const { hash, status } = transaction;

    store.dispatch(
      updateSignedTransactionStatus({
        sessionId,
        status,
        transactionHash: hash
      })
    );
  }

  if (batchIsSuccessful) {
    removeBatchTransactions(batchId);
  }
}
