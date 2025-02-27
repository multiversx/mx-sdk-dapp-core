import { getTransactionsSessionStatus } from 'core/managers/TransactionManager/helpers/getTransactionsStatus';
import { getStore } from 'store/store';
import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum
} from 'types/enums.types';
import {
  TransactionsDisplayInfoType,
  SignedTransactionType
} from 'types/transactions.types';

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
              ...transaction,
              ...(updatedTransaction ?? {})
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

export const clearCompletedTransactions = () => {
  getStore().setState(
    ({ transactions: state, toasts: toastsState }) => {
      // Get all session IDs
      const sessionIds = Object.keys(state);

      // Filter out completed transaction sessions
      const completedSessionIds = sessionIds.filter((sessionId) => {
        const session = state[sessionId];
        if (!session) {
          return false;
        }

        const { status } = session;

        // Check if transaction is pending/in progress
        const isPending =
          status === TransactionServerStatusesEnum.pending ||
          status === TransactionBatchStatusesEnum.signed ||
          status === TransactionBatchStatusesEnum.sent;

        // If not pending, it's completed (successful, failed, or timed out)
        return !isPending;
      });

      // Remove completed transaction sessions from state
      completedSessionIds.forEach((sessionId) => {
        delete state[sessionId];
      });

      // Also remove the corresponding toast entries for these sessions
      toastsState.transactionToasts = toastsState.transactionToasts.filter(
        (toast) => !completedSessionIds.includes(toast.toastId)
      );
    },
    false,
    'clearCompletedTransactions'
  );
};
