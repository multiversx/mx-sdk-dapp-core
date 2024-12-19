import { TransactionBatchStatusesEnum } from 'types';
import { SignedTransactionType } from 'types/transactions.types';

export interface TrackedTransactionsSliceType {
  [sessionId: string]: {
    transactions: SignedTransactionType[];
    status?: TransactionBatchStatusesEnum;
    errorMessage?: string;
    enableToasts?: boolean;
  };
}
