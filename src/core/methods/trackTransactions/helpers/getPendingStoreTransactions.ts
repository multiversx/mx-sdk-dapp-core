import {
  pendingSessionsSelector,
  pendingTransactionsSelector
} from 'store/selectors/transactionsSelector';
import { ITransactionsSlice } from 'store/slices/transactions/transactionsSlice.types';
import { getState } from 'store/store';
import { SignedTransactionType } from 'types/transactions.types';

export interface UseGetPendingTransactionsReturnType {
  pendingTransactions: SignedTransactionType[];
  pendingSessions: ITransactionsSlice;
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
