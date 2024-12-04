import { GetTransactionsByHashesType } from 'types/transactions.types';

export interface TransactionsTrackerType {
  getTransactionsByHash?: GetTransactionsByHashesType;
  onSuccess?: (sessionId: string | null) => void;
  onFail?: (sessionId: string | null, errorMessage?: string) => void;
}
