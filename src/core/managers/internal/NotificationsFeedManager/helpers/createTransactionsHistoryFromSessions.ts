import { SignedTransactionType } from 'types/transactions.types';

export interface SessionType {
  transactions?: SignedTransactionType[];
}

export type SessionsType = Record<string, SessionType>;

export const createTransactionsHistoryFromSessions = (
  sessions: SessionsType
): SignedTransactionType[] => {
  const sortedSessionKeys = Object.keys(sessions).sort(
    (a, b) => Number(b) - Number(a)
  );

  return sortedSessionKeys.reduce<SignedTransactionType[]>(
    (allTransactions, sessionKey) => {
      const sessionTransactions = sessions[sessionKey]?.transactions || [];
      return [...allTransactions, ...sessionTransactions];
    },
    []
  );
};
