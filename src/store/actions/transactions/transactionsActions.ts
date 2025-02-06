import { getStore } from 'store/store';
import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum
} from 'types/enums.types';
import {
  TransactionsDisplayInfoType,
  SignedTransactionType
} from 'types/transactions.types';

import { getTransactionsSessionStatus } from 'core/managers/TransactionManager/helpers/getTransactionsStatus';

export const createTransactionsSession = ({
  transactions,
  transactionsDisplayInfo,
  status
}: {
  transactions: SignedTransactionType[];
  transactionsDisplayInfo?: TransactionsDisplayInfoType;
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

export const updateTransactionStatus = ({
  sessionId,
  transaction: updatedTransaction
}: {
  sessionId: string;
  transaction: SignedTransactionType;
}) => {
  getStore().setState(
    ({ transactions: state }) => {
      const transactions = state[sessionId]?.transactions;
      if (transactions != null) {
        state[sessionId].transactions = transactions.map((transaction) => {
          if (transaction.hash === updatedTransaction.hash) {
            return {
              ...(updatedTransaction ?? {}),
              ...transaction
            };
          }
          return transaction;
        });

        const status = getTransactionsSessionStatus(transactions);
        if (status) {
          state[sessionId].status = status;
        }
      }
    },
    false,
    'updateTransactionStatus'
  );
};
