import { TransactionsSliceType } from 'store/slices/transactions/transactionsSlice.types';
import { SignedTransactionType } from 'types/transactions.types';

export const createTransactionsHistoryFromSessions = (
  sessions: TransactionsSliceType
): SignedTransactionType[] => {
  const sortedSessionKeys = Object.keys(sessions).sort(
    (a, b) => Number(b) - Number(a)
  );

  return sortedSessionKeys.reduce<SignedTransactionType[]>(
    (allTransactions, sessionKey: string) => {
      const sessionTransactions = sessions[sessionKey]?.transactions || [];
      return [...allTransactions, ...sessionTransactions];
    },
    []
  );
};
