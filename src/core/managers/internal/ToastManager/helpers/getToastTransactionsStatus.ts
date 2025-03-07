import { isServerTransactionPending } from 'store/actions/transactions/transactionStateByStatus';
import { TransactionServerStatusesEnum } from 'types';
import { ISignedTransaction } from 'types/transactions.types';

export const getToastTransactionsStatus = (
  transactions: ISignedTransaction[]
) => {
  const processedTransactions = transactions.filter(
    (tx) =>
      !isServerTransactionPending(tx.status as TransactionServerStatusesEnum)
  ).length;

  const totalTransactions = transactions.length;

  if (totalTransactions === 1 && processedTransactions === 1) {
    return isServerTransactionPending(
      transactions[0].status as TransactionServerStatusesEnum
    )
      ? 'Processing transaction'
      : 'Transaction processed';
  }

  return `${processedTransactions} / ${totalTransactions} transactions processed`;
};
