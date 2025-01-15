import { StoreType } from 'store/store.types';
import { createDeepEqualSelector } from './helpers';

const toastsSliceSelector = ({ toasts }: StoreType) => toasts;

export const customToastsSelector = createDeepEqualSelector(
  toastsSliceSelector,
  (state) => state.customToasts
);

export const transactionToastsSelector = createDeepEqualSelector(
  toastsSliceSelector,
  (state) => state.transactionToasts
);
