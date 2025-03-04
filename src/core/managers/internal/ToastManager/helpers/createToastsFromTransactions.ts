import { getExplorerAddress } from 'core/methods/network/getExplorerAddress';
import {
  getIsTransactionFailed,
  getIsTransactionPending,
  getIsTransactionSuccessful,
  getIsTransactionTimedOut
} from 'store/actions/transactions/transactionStateByStatus';
import { ToastsSliceType } from 'store/slices/toast/toastSlice.types';
import { AccountType } from 'types/account.types';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { SessionTransactionType } from 'types/transactions.types';
import { createTransactionToast } from './createTransactionToast';
import { ITransactionToast } from '../types/toast.types';

interface CreateToastsFromTransactionsReturnType {
  processingTransactions: ITransactionToast[];
  completedTransactions: ITransactionToast[];
}

interface CreateToastsFromTransactionsParamsType {
  toastList: ToastsSliceType;
  sessions: Record<string, SessionTransactionType>;
  account: AccountType;
  existingCompletedTransactions?: ITransactionToast[];
}

export const createToastsFromTransactions = ({
  toastList,
  sessions,
  account,
  existingCompletedTransactions = []
}: CreateToastsFromTransactionsParamsType): CreateToastsFromTransactionsReturnType => {
  const processingTransactions: ITransactionToast[] = [];
  const completedTransactions: ITransactionToast[] = [
    ...existingCompletedTransactions
  ];
  const explorerAddress = getExplorerAddress();

  for (const toast of toastList.transactionToasts) {
    const session = sessions[toast.toastId];
    if (!session?.status) {
      continue;
    }

    const { status, transactions, transactionsDisplayInfo } = session;

    const isTimedOut = getIsTransactionTimedOut(status);
    const isFailed = getIsTransactionFailed(status);
    const isSuccessful = getIsTransactionSuccessful(status);
    const isCompleted = isTimedOut || isFailed || isSuccessful;
    const isPending = getIsTransactionPending(status);
    const { startTime, endTime } = toast;

    if (
      isCompleted &&
      completedTransactions.some((t) => t.toastId === toast.toastId)
    ) {
      continue;
    }

    const transactionToast = createTransactionToast({
      toast,
      account,
      status: status as TransactionServerStatusesEnum,
      transactions,
      transactionsDisplayInfo,
      explorerAddress,
      startTime,
      endTime
    });

    if (isCompleted) {
      completedTransactions.push(transactionToast);
    }

    if (isPending) {
      processingTransactions.push(transactionToast);
    }
  }

  return {
    processingTransactions,
    completedTransactions
  };
};
