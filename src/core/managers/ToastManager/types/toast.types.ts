import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum
} from 'types';

export enum TransactionsDefaultTitles {
  success = 'Transaction successful',
  received = 'Transaction received',
  failed = 'Transaction failed',
  pending = 'Processing transaction',
  timedOut = 'Transaction timed out',
  invalid = 'Transaction invalid'
}

export interface GetToastsOptionsDataPropsType {
  address: string;
  sender: string;
  status?: TransactionBatchStatusesEnum | TransactionServerStatusesEnum;
  toastId: string;
}

export interface IToastDataState {
  id: string;
  icon: string;
  hasCloseButton: boolean;
  title: string;
  iconClassName: string;
}
export interface ITransactionProgressState {
  progressClass?: string;
  currentRemaining: number;
}
export interface ITransaction {
  hash: string;
  status: string;
}
export interface ITransactionToast {
  toastId: string;
  wrapperClass?: string; // TODO: remove ?
  processedTransactionsStatus: string;
  transactions: ITransaction[];
  toastDataState: IToastDataState;
  transactionProgressState?: ITransactionProgressState;
}

export enum TransactionToastEventsEnum {
  'CLOSE_TOAST' = 'CLOSE_TOAST',
  'TRANSACTION_TOAST_DATA_UPDATE' = 'TRANSACTION_TOAST_DATA_UPDATE'
}
