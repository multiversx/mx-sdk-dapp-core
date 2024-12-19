import { StateCreator } from 'zustand/vanilla';
import { StoreType, MutatorsIn } from 'store/store.types';
import { ToastsSliceState } from './toastSlice.types';

const initialState: ToastsSliceState = {
  customToasts: [],
  transactionToasts: []
};

function getToastSlice(): StateCreator<
  StoreType,
  MutatorsIn,
  [],
  ToastsSliceState
> {
  return () => initialState;
}

export const toastSlice = getToastSlice();
