import { getExplorerAddress } from 'core/methods/network/getExplorerAddress';
import {
  getIsTransactionFailed,
  getIsTransactionPending,
  getIsTransactionSuccessful,
  getIsTransactionTimedOut
} from 'store/actions/transactions/transactionStateByStatus';
import { ToastsSliceType } from 'store/slices/toast/toastSlice.types';
import { createTransactionToast } from './createTransactionToast';
import { ITransactionToast } from '../types/toast.types';

interface ProcessTransactionsResult {
  processingTransactions: ITransactionToast[];
  completedTransactions: ITransactionToast[];
}

/**
 * Process transactions from the toast list and categorize them as processing or completed
 * This is shared between ToastManager and NotificationsFeedManager
 */
export const processTransactions = (
  toastList: ToastsSliceType,
  sessions: any,
  account: any,
  existingCompletedTransactions: ITransactionToast[] = []
): ProcessTransactionsResult => {
  const processingTransactions: ITransactionToast[] = [];
  const completedTransactions: ITransactionToast[] = [
    ...existingCompletedTransactions
  ];
  const explorerAddress = getExplorerAddress();

  for (const toast of toastList.transactionToasts) {
    const sessionTransactions = sessions[toast.toastId];
    if (!sessionTransactions) {
      continue;
    }

    const { startTime, toastId, endTime } = toast;
    const { status, transactions, transactionsDisplayInfo } =
      sessionTransactions;

    const isPending = getIsTransactionPending(status);
    const isTimedOut = getIsTransactionTimedOut(status);
    const isFailed = getIsTransactionFailed(status);
    const isSuccessful = getIsTransactionSuccessful(status);
    const isCompleted = isFailed || isSuccessful || isTimedOut;

    if (isCompleted) {
      // Add to completed transactions if not already present
      if (!completedTransactions.some((t) => t.toastId === toastId)) {
        const completedTransaction = createTransactionToast({
          toast,
          account,
          status,
          transactions,
          transactionsDisplayInfo,
          explorerAddress,
          startTime,
          endTime
        });
        completedTransactions.push(completedTransaction);
      }
    } else if (isPending) {
      // Add to processing transactions
      const transactionToast = createTransactionToast({
        toast,
        account,
        status,
        transactions,
        transactionsDisplayInfo,
        explorerAddress,
        startTime,
        endTime
      });
      processingTransactions.push(transactionToast);
    }
  }

  return {
    processingTransactions,
    completedTransactions
  };
};
