import { StateCreator } from 'zustand/vanilla';
import { StoreType, MutatorsIn } from 'store/store.types';
import { ITransactionsSlice } from './transactionsSlice.types';

export const initialState: ITransactionsSlice = {};

function getTransactionsSlice(): StateCreator<
  StoreType,
  MutatorsIn,
  [],
  ITransactionsSlice
> {
  return () => initialState;
}

export const transactionsSlice = getTransactionsSlice();
