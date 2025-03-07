import { IPlainTransactionObject, Transaction } from '@multiversx/sdk-core/out';
import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum,
  TransactionTypesEnum
} from 'types/enums.types';
import { ResultType } from './serverTransactions.types';

export interface ISignedTransaction extends IPlainTransactionObject {
  hash: string;
  status?: TransactionServerStatusesEnum | TransactionBatchStatusesEnum;
  inTransit?: boolean;
}

export interface IMultiSignTransaction {
  multiTxData?: string;
  transactionIndex: number;
  transaction: Transaction;
}

interface IMultiEsdtType {
  type:
    | TransactionTypesEnum.esdtTransaction
    | TransactionTypesEnum.nftTransaction;
  receiver: string;
  token?: string;
  nonce?: string;
  amount?: string;
  data: string;
}

interface IMultiEsdtScCallType {
  type: TransactionTypesEnum.scCall;
  receiver: string;
  token?: string;
  nonce?: string;
  amount?: string;
  data: string;
}

export type MultiEsdtTransactionType = IMultiEsdtType | IMultiEsdtScCallType;

export interface ITransactionDataToken {
  tokenId: string;
  amount: string;
  receiver: string;
  type?: MultiEsdtTransactionType['type'] | '';
  nonce?: string;
  multiTxData?: string;
}

export type TransactionsDataTokensType =
  | Record<string, ITransactionDataToken>
  | undefined;

export type TrackedTransactionResultType = ISignedTransaction & {
  invalidTransaction: boolean;
  results: ResultType[];
  previousStatus: string;
  hasStatusChanged: boolean;
};

export enum TransactionDirectionEnum {
  SELF = 'Self',
  INTERNAL = 'Internal',
  IN = 'In',
  OUT = 'Out'
}

/**
 * Allows editing the title toast information
 */
export interface ITransactionsDisplayInfo {
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
  transactions: ISignedTransaction[];
  status?: TransactionBatchStatusesEnum | TransactionServerStatusesEnum;
  errorMessage?: string;
  /**
   * Optional custom information to be displayed in the toast notification.
   */
  transactionsDisplayInfo?: ITransactionsDisplayInfo;
};
