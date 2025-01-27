import { getStore } from 'store/store';
import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum
} from 'types/enums.types';
import { ServerTransactionType } from 'types/serverTransactions.types';
import {
  ITransactionsDisplayInfo,
  SignedTransactionType
} from 'types/transactions.types';
import {
  getIsTransactionFailed,
  getIsTransactionNotExecuted,
  getIsTransactionSuccessful
} from './transactionStateByStatus';

export interface UpdateTrackedTransactionStatusPayloadType {
  sessionId: string;
  transactionHash: string;
  status: TransactionServerStatusesEnum | TransactionBatchStatusesEnum;
  serverTransaction?: ServerTransactionType;
  errorMessage?: string;
  inTransit?: boolean;
}

export const createTrackedTransactionsSession = (
  transactions: SignedTransactionType[],
  transactionsDisplayInfo?: ITransactionsDisplayInfo
) => {
  const sessionId = Date.now().toString();
  getStore().setState(({ trackedTransactions: state }) => {
    state[sessionId] = {
      transactions,
      status: TransactionBatchStatusesEnum.sent,
      transactionsDisplayInfo
    };
  });
  return sessionId;
};

export const updateTrackedTransactionsSession = ({
  sessionId,
  status,
  errorMessage
}: {
  sessionId: string;
  status: TransactionBatchStatusesEnum;
  errorMessage?: string;
}) => {
  getStore().setState(({ trackedTransactions: state }) => {
    state[sessionId].status = status;
    state[sessionId].errorMessage = errorMessage;
  });
};

export const updateTrackedTransactionStatus = (
  payload: UpdateTrackedTransactionStatusPayloadType
) => {
  const {
    sessionId,
    status,
    errorMessage,
    transactionHash,
    serverTransaction,
    inTransit
  } = payload;
  getStore().setState(({ trackedTransactions: state }) => {
    const transactions = state[sessionId]?.transactions;
    if (transactions != null) {
      state[sessionId].transactions = transactions.map((transaction) => {
        if (transaction.hash === transactionHash) {
          return {
            ...(serverTransaction ?? {}),
            ...transaction,
            status: status as TransactionServerStatusesEnum,
            errorMessage,
            inTransit
          };
        }
        return transaction;
      });
      const areTransactionsSuccessful = state[sessionId]?.transactions?.every(
        (transaction) => {
          return getIsTransactionSuccessful(transaction.status);
        }
      );

      const areTransactionsFailed = state[sessionId]?.transactions?.some(
        (transaction) => getIsTransactionFailed(transaction.status)
      );

      const areTransactionsNotExecuted = state[sessionId]?.transactions?.every(
        (transaction) => getIsTransactionNotExecuted(transaction.status)
      );

      if (areTransactionsSuccessful) {
        state[sessionId].status = TransactionBatchStatusesEnum.success;
      }
      if (areTransactionsFailed) {
        state[sessionId].status = TransactionBatchStatusesEnum.fail;
      }
      if (areTransactionsNotExecuted) {
        state[sessionId].status = TransactionBatchStatusesEnum.invalid;
      }
    }
  });
};
