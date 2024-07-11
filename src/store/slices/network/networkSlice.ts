import { StateCreator } from 'zustand/vanilla';
import { NetworkSliceType } from './networkSlice.types';
import { DAppStoreState, MutatorsIn } from 'store/store.types';
import { emptyNetwork } from './emptyNetwork';

const initialState: NetworkSliceType = {
  network: emptyNetwork
};

function getNetworkConfigSlice(): StateCreator<
  DAppStoreState,
  MutatorsIn,
  [],
  NetworkSliceType
> {
  return () => initialState;
}

export const networkConfigSlice = getNetworkConfigSlice();
