import { TrackedTransactionsSliceType } from 'store/slices/trackedTransactions/trackedTransactionsSlice.types';
import { StoreType } from 'store/store.types';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { SignedTransactionType } from 'types/transactions.types';

export const transactionsSliceSelector = ({ trackedTransactions }: StoreType) =>
  trackedTransactions;

export const pendingTrackedSessionsSelector = ({
  trackedTransactions: state
}: StoreType): TrackedTransactionsSliceType => {
  const pendingSessions: TrackedTransactionsSliceType = {};

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

export const pendingTrackedTransactionsSelector = ({
  trackedTransactions: state
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
