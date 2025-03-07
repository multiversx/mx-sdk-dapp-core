import type { ServerTransactionType } from 'types/serverTransactions.types';

export enum TransactionActionCategoryTypeEnum {
  mex = 'mex',
  stake = 'stake'
}

export interface ProcessTransactionActionParamsType {
  currentUserAddress: string;
  transaction: ServerTransactionType;
  egldLabel?: string;
  isPending?: boolean;
}
