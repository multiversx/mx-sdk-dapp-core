import { getServerTransactionsByHashes } from 'apiCalls/transactions/getServerTransactionsByHashes';
import { createTransactionsHistoryFromSessions } from './createTransactionsHistoryFromSessions';
import { mapTransactionToListItem } from './mapTransactionToListItem';
import type {
  TransactionListItem,
  GetHistoricalTransactionsParamsType
} from '../types/transaction.types';

export const getHistoricalTransactions = async ({
  sessions,
  address,
  explorerAddress,
  egldLabel
}: GetHistoricalTransactionsParamsType): Promise<TransactionListItem[]> => {
  const signedTransactions = createTransactionsHistoryFromSessions(sessions);

  const serverTransactions = await getServerTransactionsByHashes(
    signedTransactions.map((tx) => tx.hash)
  );

  return serverTransactions.map((transaction) =>
    mapTransactionToListItem({
      transaction,
      address,
      explorerAddress,
      egldLabel
    })
  );
};
