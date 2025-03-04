import { getIsTransactionPending } from 'store/actions/transactions/transactionStateByStatus';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import {
  SignedTransactionType,
  TransactionsDisplayInfoType
} from 'types/transactions.types';
import { explorerUrlBuilder } from 'utils/transactions/explorerUrlBuilder';
import { getExplorerLink } from 'utils/transactions/getExplorerLink';
import { getToastDataStateByStatus } from './getToastDataStateByStatus';
import { getToastProceededStatus } from './getToastProceededStatus';
import { ITransactionToast } from '../types/toast.types';

interface CreateTransactionToastParamsType {
  toast: {
    toastId: string;
  };
  account: {
    address: string;
  };
  status: TransactionServerStatusesEnum;
  transactions: SignedTransactionType[];
  transactionsDisplayInfo?: TransactionsDisplayInfoType;
  explorerAddress: string;
  startTime: number;
  endTime: number;
}

export const createTransactionToast = ({
  toast,
  account,
  status,
  transactions,
  transactionsDisplayInfo,
  explorerAddress,
  startTime,
  endTime
}: CreateTransactionToastParamsType): ITransactionToast => {
  const { toastId } = toast;
  const isPending = getIsTransactionPending(status);

  const toastDataState = getToastDataStateByStatus({
    address: account.address,
    sender: transactions[0]?.sender || '',
    toastId,
    status,
    transactionsDisplayInfo
  });

  const processedTransactionsStatus = getToastProceededStatus(transactions);

  const transactionProgressState = isPending
    ? {
        endTime,
        startTime
      }
    : null;

  const mappedTransactions = transactions.map(({ hash, status: txStatus }) => ({
    hash,
    status: txStatus ?? TransactionServerStatusesEnum.pending,
    link: getExplorerLink({
      explorerAddress,
      to: explorerUrlBuilder.transactionDetails(hash)
    })
  }));

  return {
    toastDataState,
    processedTransactionsStatus,
    transactionProgressState,
    toastId,
    transactions: mappedTransactions
  };
};
