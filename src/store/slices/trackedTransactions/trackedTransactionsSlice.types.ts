import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum
} from 'types';
import {
  ITransactionsDisplayInfo,
  SignedTransactionType
} from 'types/transactions.types';

export interface TrackedTransactionsSliceType {
  [sessionId: string]: {
    transactions: SignedTransactionType[];
    status?: TransactionBatchStatusesEnum | TransactionServerStatusesEnum;
    errorMessage?: string;
    /**
     * Optional custom information to be displayed in the toast notification.
     */
    transactionsDisplayInfo?: ITransactionsDisplayInfo;
  };
}
