import { TransactionsSliceType } from './transactionsSlice.types';
import { StateCreator } from 'zustand/vanilla';
import { MutatorsIn, StoreType } from 'store/store.types';

export const initialState: TransactionsSliceType = {
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
  TransactionsSliceType
> {
  return () => initialState;
}

export const transactionsSlice = getTransactionsSlice();
