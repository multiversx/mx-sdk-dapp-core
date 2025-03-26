import { ITransactionListItem } from 'lib/sdkDappCoreUi';
import { SessionTransactionType } from 'types/transactions.types';

export type TransactionsSliceType = {
  sessions: Record<string, SessionTransactionType>;
  interpretedTransactions: Record<string, ITransactionListItem>;
};
