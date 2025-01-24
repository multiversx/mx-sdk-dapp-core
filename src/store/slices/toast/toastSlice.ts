import { StateCreator } from 'zustand/vanilla';
import { StoreType, MutatorsIn } from 'store/store.types';
import { IToastsSliceState } from './toastSlice.types';

const initialState: IToastsSliceState = {
  customToasts: [],
  transactionToasts: [],
  toastProgress: {}
};

function getToastSlice(): StateCreator<
  StoreType,
  MutatorsIn,
  [],
  IToastsSliceState
> {
  return () => initialState;
}

export const toastSlice = getToastSlice();
