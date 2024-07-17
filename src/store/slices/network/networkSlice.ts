import { StateCreator } from 'zustand/vanilla';
import { NetworkSliceType } from './networkSlice.types';
import { StoreType, MutatorsIn } from 'store/store.types';
import { emptyNetwork } from './emptyNetwork';

const initialState: NetworkSliceType = {
  network: emptyNetwork
};

function getNetworkSlice(): StateCreator<
  StoreType,
  MutatorsIn,
  [],
  NetworkSliceType
> {
  return () => initialState;
}

export const networkSlice = getNetworkSlice();
