import { StateCreator } from 'zustand/vanilla';
import { StoreType, MutatorsIn } from 'store/store.types';
import { TrackedTransactionsSliceType } from './trackedTransactionsSlice.types';

const initialState: TrackedTransactionsSliceType = {};

function getTrackedTransactionsSlice(): StateCreator<
  StoreType,
  MutatorsIn,
  [],
  TrackedTransactionsSliceType
> {
  return () => initialState;
}

export const trackedTransactionsSlice = getTrackedTransactionsSlice();
