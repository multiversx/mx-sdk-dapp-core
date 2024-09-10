import { StateCreator } from 'zustand/vanilla';
import { StoreType, MutatorsIn } from 'store/store.types';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { IPlainTransactionObject } from '@multiversx/sdk-core/out';

export interface SignedTransactionType extends IPlainTransactionObject {
  hash: string;
  status: TransactionServerStatusesEnum;
  inTransit?: boolean;
}

export interface TransactionsSliceType {
  [sessionId: string]: SignedTransactionType[];
}
