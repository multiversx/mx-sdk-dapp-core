import { TransactionsSliceType } from 'store/slices/transactions/transacitionsSlice.types';
import { StoreType } from 'store/store.types';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { SignedTransactionType } from 'types/transactions.types';

export const transactionsSliceSelector = ({ transactions }: StoreType) =>
  transactions;

export const pendingSessionsSelector = ({
  transactions: state
}: StoreType): TransactionsSliceType => {
  const pendingSessions: TransactionsSliceType = {};

  Object.entries(state).forEach(([sessionId, data]) => {
    const hasPendingTransactions = data.transactions.some(
      ({ status }) => status === TransactionServerStatusesEnum.pending
    );
    if (hasPendingTransactions && data.status === 'sent') {
      pendingSessions[sessionId] = data;
    }
  });

  return pendingSessions;
};

export const pendingTransactionsSelector = ({
  transactions: state
}: StoreType) => {
  const pendingTransactions: SignedTransactionType[] = [];

  Object.values(state).forEach(({ transactions }) => {
    transactions.forEach((transaction) => {
      if (transaction.status === TransactionServerStatusesEnum.pending) {
        pendingTransactions.push(transaction);
      }
    });
  });

  return pendingTransactions;
};
