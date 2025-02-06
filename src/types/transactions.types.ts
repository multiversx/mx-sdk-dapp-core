import { IPlainTransactionObject, Transaction } from '@multiversx/sdk-core/out';
import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum,
  TransactionTypesEnum
} from 'types/enums.types';
import { ResultType } from './serverTransactions.types';

export interface SignedTransactionType extends IPlainTransactionObject {
  hash: string;
  status: TransactionServerStatusesEnum | TransactionBatchStatusesEnum;
  inTransit?: boolean;
}

export interface MultiSignTransactionType {
  multiTxData?: string;
  transactionIndex: number;
  transaction: Transaction;
}

interface MultiEsdtType {
  type:
    | TransactionTypesEnum.esdtTransaction
    | TransactionTypesEnum.nftTransaction;
  receiver: string;
  token?: string;
  nonce?: string;
  amount?: string;
  data: string;
}

interface MultiEsdtScCallType {
  type: TransactionTypesEnum.scCall;
  receiver: string;
  token?: string;
  nonce?: string;
  amount?: string;
  data: string;
}

export type MultiEsdtTransactionType = MultiEsdtType | MultiEsdtScCallType;

export interface TransactionDataTokenType {
  tokenId: string;
  amount: string;
  receiver: string;
  type?: MultiEsdtTransactionType['type'] | '';
  nonce?: string;
  multiTxData?: string;
}

export type TransactionsDataTokensType =
  | Record<string, TransactionDataTokenType>
  | undefined;

export type PendingTransactionsType = {
  hash: string;
  previousStatus: string;
}[];

export type GetTransactionsByHashesReturnType = {
  hash: string;
  invalidTransaction: boolean;
  status: TransactionServerStatusesEnum | TransactionBatchStatusesEnum;
  inTransit?: boolean;
  results: ResultType[];
  sender: string;
  receiver: string;
  data: string;
  previousStatus: string;
  hasStatusChanged: boolean;
}[];

export type GetTransactionsByHashesType = (
  pendingTransactions: PendingTransactionsType
) => Promise<GetTransactionsByHashesReturnType>;

export enum TransactionDirectionEnum {
  SELF = 'Self',
  INTERNAL = 'Internal',
  IN = 'In',
  OUT = 'Out'
}

/**
 * Allows editing the title toast information
 */
export interface TransactionsDisplayInfoType {
  /**
   * Optional error message to be displayed in notification title in notification title if the transaction fails.
   */
  errorMessage?: string;

  /**
   * Optional success message to be displayed in notification title if the transaction succeeds.
   */
  successMessage?: string;

  /**
   * Optional message to be displayed in notification title while the transaction is processing.
   */
  processingMessage?: string;

  /**
   * Optional message to be displayed in notification title when the transaction is submitted.
   */
  submittedMessage?: string;

  /**
   * Optional duration of the transaction in milliseconds.
   */
  transactionDuration?: number;

  /**
   * Optional message to be displayed in notification title if the transaction times out.
   */
  timedOutMessage?: string;

  /**
   * Optional message to be displayed in notification title if the transaction is invalid.
   */
  invalidMessage?: string;

  /**
   * Optional message to be displayed in notification title when the transaction is received.
   */
  receivedMessage?: string;
}

export type SessionTransactionType = {
  transactions: SignedTransactionType[];
  status?: TransactionBatchStatusesEnum | TransactionServerStatusesEnum;
  errorMessage?: string;
  /**
   * Optional custom information to be displayed in the toast notification.
   */
  transactionsDisplayInfo?: TransactionsDisplayInfoType;
};
