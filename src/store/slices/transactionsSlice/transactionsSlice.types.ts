import {
  CustomTransactionInformation,
  ServerTransactionType,
  SignedTransactionsBodyType,
  SignedTransactionsType,
  SignedTransactionType,
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum,
  TransactionsToSignType
} from 'types';
import { Transaction } from '@multiversx/sdk-core/out';

export interface UpdateSignedTransactionsPayloadType {
  sessionId: string;
  status: TransactionBatchStatusesEnum;
  errorMessage?: string;
  transactions?: SignedTransactionType[];
  customTransactionInformationOverrides?: Partial<CustomTransactionInformation>;
}

export interface MoveTransactionsToSignedStatePayloadType
  extends SignedTransactionsBodyType {
  sessionId: string;
  customTransactionInformation?: CustomTransactionInformation;
}

export interface UpdateSignedTransactionStatusPayloadType {
  sessionId: string;
  transactionHash: string;
  status: TransactionServerStatusesEnum;
  serverTransaction?: ServerTransactionType;
  errorMessage?: string;
  inTransit?: boolean;
}

export interface TransactionsSliceType {
  signedTransactions: SignedTransactionsType;
  transactionsToSign: TransactionsToSignType | null;
  signTransactionsError: string | null;
  signTransactionsCancelMessage: string | null;
  customTransactionInformationForSessionId: {
    [sessionId: string]: CustomTransactionInformation;
  };
}

export interface TransactionsToSignReturnType {
  callbackRoute?: string;
  sessionId: string;
  transactions: Transaction[];
  customTransactionInformation: CustomTransactionInformation;
}
