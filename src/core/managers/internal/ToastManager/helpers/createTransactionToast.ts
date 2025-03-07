import { getIsTransactionPending } from 'store/actions/transactions/transactionStateByStatus';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import {
  SignedTransactionType,
  TransactionsDisplayInfoType
} from 'types/transactions.types';
import { explorerUrlBuilder } from 'utils/transactions/explorerUrlBuilder';
import { getExplorerLink } from 'utils/transactions/getExplorerLink';
import { getToastDataStateByStatus } from './getToastDataStateByStatus';
import { getToastTransactionsStatus } from './getToastTransactionsStatus';
import { ITransactionToast } from '../types/toast.types';

interface CreateTransactionToastParamsType {
  toastId: string;
  address: string;
  status: TransactionServerStatusesEnum;
  transactions: SignedTransactionType[];
  transactionsDisplayInfo?: TransactionsDisplayInfoType;
  explorerAddress: string;
  startTime: number;
  endTime: number;
}

export const createTransactionToast = ({
  toastId,
  address,
  status,
  transactions,
  transactionsDisplayInfo,
  explorerAddress,
  startTime,
  endTime
}: CreateTransactionToastParamsType): ITransactionToast => {
  const isPending = getIsTransactionPending(status);

  const toastDataState = getToastDataStateByStatus({
    address,
    sender: transactions[0]?.sender || '',
    toastId,
    status,
    transactionsDisplayInfo
  });

  const processedTransactionsStatus = getToastTransactionsStatus(transactions);

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
