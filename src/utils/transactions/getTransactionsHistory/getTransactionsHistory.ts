import isEmpty from 'lodash/isEmpty';
import { getServerTransactionsByHashes } from 'apiCalls/transactions/getServerTransactionsByHashes';
import type {
  GetHistoricalTransactionsParamsType,
  TransactionListItemType
} from 'types/transaction-list-item.types';
import {
  createTransactionsHistoryFromSessions,
  mapTransactionToListItem
} from './helpers';

export const getTransactionsHistory = async ({
  sessions,
  address,
  explorerAddress,
  egldLabel
}: GetHistoricalTransactionsParamsType): Promise<TransactionListItemType[]> => {
  if (isEmpty(sessions)) {
    return [];
  }

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
