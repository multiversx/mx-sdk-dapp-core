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
    transactionsDisplayInfo?: ITransactionsDisplayInfo;
  };
}
