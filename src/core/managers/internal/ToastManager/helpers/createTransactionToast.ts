import { getIsTransactionPending } from 'store/actions/transactions/transactionStateByStatus';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { SignedTransactionType } from 'types/transactions.types';
import { explorerUrlBuilder } from 'utils/transactions/explorerUrlBuilder';
import { getExplorerLink } from 'utils/transactions/getExplorerLink';
import { getToastDataStateByStatus } from './getToastDataStateByStatus';
import { getToastProceededStatus } from './getToastProceededStatus';
import { ITransactionToast } from '../types/toast.types';

interface CreateTransactionToastProps {
  toast: {
    toastId: string;
  };
  account: {
    address: string;
  };
  status: any;
  transactions: SignedTransactionType[];
  transactionsDisplayInfo?: any;
  explorerAddress: string;
  startTime: number;
  endTime: number;
}

/**
 * Creates a transaction toast object based on transaction data
 * This is shared between ToastManager and NotificationsFeedManager
 */
export const createTransactionToast = ({
  toast,
  account,
  status,
  transactions,
  transactionsDisplayInfo,
  explorerAddress,
  startTime,
  endTime
}: CreateTransactionToastProps): ITransactionToast => {
  const { toastId } = toast;
  const isPending = getIsTransactionPending(status);

  return {
    toastDataState: getToastDataStateByStatus({
      address: account.address,
      sender: transactions[0]?.sender || '',
      toastId,
      status,
      transactionsDisplayInfo
    }),
    processedTransactionsStatus: getToastProceededStatus(transactions),
    transactionProgressState: isPending
      ? {
          endTime,
          startTime
        }
      : null,
    toastId,
    transactions: transactions.map(({ hash, status: txStatus }) => ({
      hash,
      status: txStatus ?? TransactionServerStatusesEnum.pending,
      link: getExplorerLink({
        explorerAddress,
        to: explorerUrlBuilder.transactionDetails(hash)
      })
    }))
  };
};
