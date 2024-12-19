import { StoreType } from 'store/store.types';

export const networkSliceSelector = ({ network }: StoreType) => network;

export const toastsSliceSelector = ({ toasts }: StoreType) => toasts;

export const customToastsSelector = ({ toasts }: StoreType) =>
  toasts.customToasts;

export const transactionToastsSelector = ({ toasts }: StoreType) =>
  toasts.transactionToasts;
