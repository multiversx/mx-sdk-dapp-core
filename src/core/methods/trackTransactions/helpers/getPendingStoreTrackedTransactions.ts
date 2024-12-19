import {
  pendingTrackedSessionsSelector,
  pendingTrackedTransactionsSelector
} from 'store/selectors/trackedTransactionsSelector';
import { TrackedTransactionsSliceType } from 'store/slices/trackedTransactions/trackedTransactionsSlice.types';
import { getState } from 'store/store';
import { SignedTransactionType } from 'types/transactions.types';

export interface UseGetPendingTrackedTransactionsReturnType {
  pendingTrackedTransactions: SignedTransactionType[];
  pendingTrackedSessions: TrackedTransactionsSliceType;
  hasPendingTrackedTransactions: boolean;
}

export function getPendingStoreTrackedTransactions(): UseGetPendingTrackedTransactionsReturnType {
  const pendingTrackedTransactions =
    pendingTrackedTransactionsSelector(getState());
  const pendingTrackedSessions = pendingTrackedSessionsSelector(getState());
  const hasPendingTrackedTransactions = pendingTrackedTransactions.length > 0;

  return {
    pendingTrackedTransactions,
    pendingTrackedSessions,
    hasPendingTrackedTransactions
  };
}
