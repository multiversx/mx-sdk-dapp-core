import { SignedTransactionType } from 'store/slices/transactions/transacitions.types';
import { getStore } from 'store/store';

export const setSentTransactions = ({
  transactions
}: {
  transactions: SignedTransactionType[];
}) => {
  const sessionId = Date.now().toString();
  getStore().setState(({ transactions: state }) => {
    state[sessionId] = transactions;
  });
  return sessionId;
};
