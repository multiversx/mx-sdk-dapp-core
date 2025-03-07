import { getIsTransactionPending } from 'store/actions/transactions/transactionStateByStatus';
import { ISignedTransaction } from 'types/transactions.types';

export function getPendingTransactions(
  transactions: ISignedTransaction[]
): ISignedTransaction[] {
  const pendingTransactions = transactions.reduce(
    (acc: ISignedTransaction[], transaction) => {
      if (
        transaction.hash != null &&
        getIsTransactionPending(transaction.status)
      ) {
        acc.push(transaction);
      }
      return acc;
    },
    []
  );
  return pendingTransactions;
}
