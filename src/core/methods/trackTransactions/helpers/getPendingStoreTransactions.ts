import {
  pendingSessionsSelector,
  pendingTransactionsSelector
} from 'store/selectors/transactionsSelector';
import { TransactionsSliceType } from 'store/slices/transactions/transacitionsSlice.types';
import { getState } from 'store/store';
import { SignedTransactionType } from 'types/transactions.types';

export interface UseGetPendingTransactionsReturnType {
  pendingTransactions: SignedTransactionType[];
  pendingSessions: TransactionsSliceType;
  hasPendingTransactions: boolean;
}

export function getPendingStoreTransactions(): UseGetPendingTransactionsReturnType {
  const pendingTransactions = pendingTransactionsSelector(getState());
  const pendingSessions = pendingSessionsSelector(getState());
  const hasPendingTransactions = pendingTransactions.length > 0;

  return {
    pendingTransactions,
    pendingSessions,
    hasPendingTransactions
  };
}
