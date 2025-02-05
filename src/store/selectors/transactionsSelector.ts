import { ITransactionsSlice } from 'store/slices/transactions/transactionsSlice.types';
import { StoreType } from 'store/store.types';
import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum
} from 'types/enums.types';
import { SignedTransactionType } from 'types/transactions.types';

export const transactionsSliceSelector = ({ transactions }: StoreType) =>
  transactions;

export const pendingSessionsSelector = ({
  transactions: state
}: StoreType): ITransactionsSlice => {
  const pendingSessions: ITransactionsSlice = {};

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

export const successfulTransactionsSelector = ({
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

export const failedTransactionsSelector = ({
  transactions: state
}: StoreType) => {
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

export const timedOutTransactionsSelector = ({
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
