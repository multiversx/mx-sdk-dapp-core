import { TransactionBatchStatusesEnum } from 'types/enums.types';
import { SignedTransactionType } from 'types/transactions.types';

export interface TransactionsSliceType {
  [sessionId: string]: {
    transactions: SignedTransactionType[];
    status?: TransactionBatchStatusesEnum;
    errorMessage?: string;
  };
}
