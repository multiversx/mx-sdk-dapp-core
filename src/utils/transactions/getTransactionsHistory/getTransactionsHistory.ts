import isEmpty from 'lodash/isEmpty';
import { ITransactionListItem } from 'lib/sdkDappCoreUi';
import type { IGetHistoricalTransactionsParams } from 'types/transaction-list-item.types';
import {
  createTransactionsHistoryFromSessions,
  mapServerTransactionsToListItems
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

  return mapServerTransactionsToListItems({
    hashes: signedTransactions.map((tx) => tx.hash),
    address,
    explorerAddress,
    egldLabel
  });
};
