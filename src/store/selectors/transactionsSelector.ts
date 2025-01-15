import { TransactionsSliceType } from 'store/slices/transactions/transacitionsSlice.types';
import { StoreType } from 'store/store.types';
import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum
} from 'types/enums.types';
import { SignedTransactionType } from 'types/transactions.types';
import { createDeepEqualSelector } from './helpers';

export const transactionsSliceSelector = createDeepEqualSelector(
  ({ transactions }: StoreType) => transactions,
  (state) => state
);

const pendingSessionsSelectorBase = ({
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

export const pendingSessionsSelector = createDeepEqualSelector(
  pendingSessionsSelectorBase,
  (state) => state
);

const pendingTransactionsSelectorBase = ({
  transactions: state
}: StoreType) => {
  const pendingTransactions: SignedTransactionType[] = [];

  Object.values(state).forEach(({ transactions }) => {
    transactions.forEach((transaction) => {
      if (
        [
          TransactionServerStatusesEnum.pending,
          TransactionBatchStatusesEnum.sent
        ].includes(transaction.status)
      ) {
        pendingTransactions.push(transaction);
      }
    });
  });

  return pendingTransactions;
};

export const pendingTransactionsSelector = createDeepEqualSelector(
  pendingTransactionsSelectorBase,
  (state) => state
);

const successfulTransactionsSelectorBase = ({
  transactions: state
}: StoreType) => {
  const successfulTransactions: SignedTransactionType[] = [];

  Object.values(state).forEach(({ transactions }) => {
    transactions.forEach((transaction) => {
      if (transaction.status === TransactionServerStatusesEnum.success) {
        successfulTransactions.push(transaction);
      }
    });
  });

  return successfulTransactions;
};

export const successfulTransactionsSelector = createDeepEqualSelector(
  successfulTransactionsSelectorBase,
  (state) => state
);

const failedTransactionsSelectorBase = ({ transactions: state }: StoreType) => {
  const successfulTransactions: SignedTransactionType[] = [];

  Object.values(state).forEach(({ transactions }) => {
    transactions.forEach((transaction) => {
      if (
        [
          TransactionServerStatusesEnum.fail,
          TransactionServerStatusesEnum.invalid,
          TransactionBatchStatusesEnum.cancelled,
          TransactionBatchStatusesEnum.timedOut
        ].includes(transaction.status)
      ) {
        successfulTransactions.push(transaction);
      }
    });
  });

  return successfulTransactions;
};

export const failedTransactionsSelector = createDeepEqualSelector(
  failedTransactionsSelectorBase,
  (state) => state
);

const timedOutTransactionsSelectorBase = ({
  transactions: state
}: StoreType) => {
  const successfulTransactions: SignedTransactionType[] = [];

  Object.values(state).forEach(({ transactions }) => {
    transactions.forEach((transaction) => {
      if (transaction.status === TransactionBatchStatusesEnum.timedOut) {
        successfulTransactions.push(transaction);
      }
    });
  });

  return successfulTransactions;
};

export const timedOutTransactionsSelector = createDeepEqualSelector(
  timedOutTransactionsSelectorBase,
  (state) => state
);
