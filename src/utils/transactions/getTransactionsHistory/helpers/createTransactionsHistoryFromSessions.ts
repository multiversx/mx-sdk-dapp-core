import { TransactionsSliceType } from 'store/slices/transactions/transactionsSlice.types';
import { ISignedTransaction } from 'types/transactions.types';

export const createTransactionsHistoryFromSessions = (
  sessions: TransactionsSliceType
): ISignedTransaction[] => {
  const sortedSessionKeys = Object.keys(sessions).sort(
    (a, b) => Number(b) - Number(a)
  );

  return sortedSessionKeys.reduce<ISignedTransaction[]>(
    (allTransactions, sessionKey: string) => {
      const sessionTransactions = sessions[sessionKey]?.transactions || [];
      return [...allTransactions, ...sessionTransactions];
    },
    []
  );
};
