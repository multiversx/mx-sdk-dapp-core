import type { TransactionsSliceType } from 'store/slices/transactions/transactionsSlice.types';
import type { ServerTransactionType } from 'types/serverTransactions.types';

export interface TransactionListItem {
  title: string;
  amount: string;
  mainIconUrl?: string;
  details?: {
    directionLabel: string;
    initiator: string;
    iconUrl?: string;
  };
  rightIcons?: string[];
}

export interface GetHistoricalTransactionsParamsType {
  sessions: TransactionsSliceType;
  address: string;
  explorerAddress: string;
  egldLabel: string;
}

export interface MapTransactionToListItemParamsType {
  transaction: ServerTransactionType;
  address: string;
  explorerAddress: string;
  egldLabel: string;
}

export interface TransactionAssetsType {
  mainIconUrl?: string;
  rightIcons?: string[];
  initiatorIconUrl?: string;
}
