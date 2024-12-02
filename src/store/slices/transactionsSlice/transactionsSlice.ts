import { TransactionsSliceStateType } from './transactionsSlice.types';
import { StateCreator } from 'zustand/vanilla';
import { MutatorsIn, StoreType } from 'store/store.types';

export const initialState: TransactionsSliceStateType = {
  signedTransactions: {},
  transactionsToSign: null,
  signTransactionsError: null,
  signTransactionsCancelMessage: null,
  customTransactionInformationForSessionId: {}
};

function getTransactionsSlice(): StateCreator<
  StoreType,
  MutatorsIn,
  [],
  TransactionsSliceStateType
> {
  return () => initialState;
}

export const transactionsSlice = getTransactionsSlice();
