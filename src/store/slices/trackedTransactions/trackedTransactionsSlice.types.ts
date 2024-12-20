import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum
} from 'types';
import { SignedTransactionType } from 'types/transactions.types';

export interface TrackedTransactionsSliceType {
  [sessionId: string]: {
    transactions: SignedTransactionType[];
    status?: TransactionBatchStatusesEnum | TransactionServerStatusesEnum;
    errorMessage?: string;
    enableToasts?: boolean;
  };
}
