import { getExplorerAddress } from 'core/methods/network/getExplorerAddress';
import {
  getIsTransactionFailed,
  getIsTransactionPending,
  getIsTransactionSuccessful,
  getIsTransactionTimedOut
} from 'store/actions/transactions/transactionStateByStatus';
import { AccountSliceType } from 'store/slices/account/account.types';
import { ToastsSliceType } from 'store/slices/toast/toastSlice.types';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { SessionTransactionType } from 'types/transactions.types';
import { createTransactionToast } from './createTransactionToast';
import { ITransactionToast } from '../types/toast.types';

interface CreateToastsFromTransactionsReturnType {
  pendingTransactions: ITransactionToast[];
  completedTransactions: ITransactionToast[];
}

interface CreateToastsFromTransactionsParamsType {
  toastList: ToastsSliceType;
  sessions: Record<string, SessionTransactionType>;
  account: AccountSliceType;
  existingCompletedTransactions?: ITransactionToast[];
}

export const createToastsFromTransactions = ({
  toastList,
  sessions,
  account,
  existingCompletedTransactions = []
}: CreateToastsFromTransactionsParamsType): CreateToastsFromTransactionsReturnType => {
  const pendingTransactions: ITransactionToast[] = [];
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
      toastId: toast.toastId,
      address: account.address,
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
      pendingTransactions.push(transactionToast);
    }
  }

  return {
    pendingTransactions,
    completedTransactions
  };
};
