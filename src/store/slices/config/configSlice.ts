import { StateCreator } from 'zustand/vanilla';
import { StoreType, MutatorsIn } from 'store/store.types';
import { ConfigSliceType } from './config.types';

// Do not export initial state for the config slice.
// This will be permanently defined by the dApp at dApp initialization.
// The config should be changed by using the `setNativeAuthConfig` action in some specific cases.
// Preferably, the config should be set at the dApp initialization and not changed during the dApp lifecycle. (e.g. when the user logs in/log out)
const initialState: ConfigSliceType = {
  nativeAuthConfig: null
};

function getConfigSlice(): StateCreator<
  StoreType,
  MutatorsIn,
  [],
  ConfigSliceType
> {
  return () => initialState;
}

export const configSlice = getConfigSlice();
