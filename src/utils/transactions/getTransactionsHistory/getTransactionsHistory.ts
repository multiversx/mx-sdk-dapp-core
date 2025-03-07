import isEmpty from 'lodash/isEmpty';
import { getServerTransactionsByHashes } from 'apiCalls/transactions/getServerTransactionsByHashes';
import { ITransactionListItem } from 'lib/sdkDappCoreUi';
import type { IGetHistoricalTransactionsParams } from 'types/transaction-list-item.types';
import {
  createTransactionsHistoryFromSessions,
  mapTransactionToListItem
} from './helpers';

export const getTransactionsHistory = async ({
  sessions,
  address,
  explorerAddress,
  egldLabel
}: IGetHistoricalTransactionsParams): Promise<ITransactionListItem[]> => {
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
