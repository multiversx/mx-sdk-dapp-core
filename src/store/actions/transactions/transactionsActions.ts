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

export interface IUpdateTransactionStatusPayload {
  sessionId: string;
  transactionHash: string;
  status: TransactionServerStatusesEnum | TransactionBatchStatusesEnum;
  serverTransaction?: ServerTransactionType;
  errorMessage?: string;
  inTransit?: boolean;
}

export const createTransactionsSession = ({
  transactions,
  transactionsDisplayInfo,
  status
}: {
  transactions: SignedTransactionType[];
  transactionsDisplayInfo?: ITransactionsDisplayInfo;
  status: TransactionBatchStatusesEnum | TransactionServerStatusesEnum;
}) => {
  const sessionId = Date.now().toString();
  getStore().setState(
    ({ transactions: state }) => {
      state[sessionId] = {
        transactions,
        status,
        transactionsDisplayInfo
      };
    },
    false,
    'createTransactionsSession'
  );
  return sessionId;
};

export const updateTransactionsSession = ({
  sessionId,
  status,
  errorMessage
}: {
  sessionId: string;
  status: TransactionBatchStatusesEnum;
  errorMessage?: string;
}) => {
  getStore().setState(
    ({ transactions: state }) => {
      state[sessionId].status = status;
      state[sessionId].errorMessage = errorMessage;
    },
    false,
    'updateTransactionsSession'
  );
};

export const updateTransactionStatus = (
  payload: IUpdateTransactionStatusPayload
) => {
  const {
    sessionId,
    status,
    errorMessage,
    transactionHash,
    serverTransaction,
    inTransit
  } = payload;
  getStore().setState(
    ({ transactions: state }) => {
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

        const areTransactionsNotExecuted = state[
          sessionId
        ]?.transactions?.every((transaction) =>
          getIsTransactionNotExecuted(transaction.status)
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
    },
    false,
    'updateTransactionStatus'
  );
};
