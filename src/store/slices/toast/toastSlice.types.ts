import { SignedTransactionType } from 'types/transactions.types';

export interface ToastsSliceState {
  customToasts: CustomToastType[];
  transactionToasts: TransactionToastType[];
  toastProgress: Record<string, number>;
}

export interface SharedCustomToast {
  toastId: string;
  /**
   * Duration in miliseconds
   */
  duration?: number;
  type?: string;
  onClose?: () => void;
}

//TODO: Implement custom toast support
export type CustomToastType = SharedCustomToast;

export interface TransactionToastType {
  duration?: number;
  icon?: string;
  iconClassName?: string;
  startTimestamp: number;
  title?: string;
  toastId: string;
  transaction?: SignedTransactionType;
  type: string;
}

export enum ToastsEnum {
  custom = 'custom',
  transaction = 'transaction'
}
