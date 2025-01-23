import { SignedTransactionType } from 'types/transactions.types';

export interface IToastsSliceState {
  customToasts: CustomToastType[];
  transactionToasts: ITransactionToast[];
  toastProgress: Record<string, number>;
}

interface ISharedCustomToast {
  toastId: string;
  /**
   * Duration in miliseconds
   */
  duration?: number;
  type?: string;
  onClose?: () => void;
}

export interface ISimpleToast extends ISharedCustomToast {
  icon?: string;
  iconClassName?: string;
  title?: string;
  message: string;
  /**
   * Use `subtitle` to display a row of information between `title` and `message`
   */
  subtitle?: string;
  instantiateToastElement?: never;
}

export interface IComponentToast extends ISharedCustomToast {
  /**
   * A function that creates a custom toast component.
   *
   * Use `instantiateToastElement` to display a custom agnostic component.
   *
   * @returns {HTMLElement | null} The custom toast component to be displayed, or `null` if no component is created.
   *
   * **⚠️ Warning**: Toasts with components will not be persisted on page reload because agnostic components are not serializable.
   */
  instantiateToastElement: (() => HTMLElement) | null;
  icon?: never;
  iconClassName?: never;
  title?: never;
  message?: never;
  subtitle?: never;
}

export type CustomToastType = ISimpleToast | IComponentToast;

export interface ITransactionToast {
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
