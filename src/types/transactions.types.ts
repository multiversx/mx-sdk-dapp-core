import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum
} from 'types/enums.types';
import { IPlainTransactionObject } from '@multiversx/sdk-core/out';

export interface SignedTransactionType extends IPlainTransactionObject {
  hash: string;
  status: TransactionServerStatusesEnum;
  inTransit?: boolean;
}

export type PendingTransactionsType = {
  hash: string;
  previousStatus: string;
}[];

export type GetTransactionsByHashesReturnType = {
  hash: string;
  invalidTransaction: boolean;
  status: TransactionServerStatusesEnum | TransactionBatchStatusesEnum;
  inTransit?: boolean;
  results: SmartContractResult[];
  sender: string;
  receiver: string;
  data: string;
  previousStatus: string;
  hasStatusChanged: boolean;
}[];

export type GetTransactionsByHashesType = (
  pendingTransactions: PendingTransactionsType
) => Promise<GetTransactionsByHashesReturnType>;

export interface SmartContractResult {
  hash: string;
  timestamp: number;
  nonce: number;
  gasLimit: number;
  gasPrice: number;
  value: string;
  sender: string;
  receiver: string;
  data: string;
  prevTxHash: string;
  originalTxHash: string;
  callType: string;
  miniBlockHash: string;
  returnMessage: string;
}
