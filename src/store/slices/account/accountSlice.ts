import { StateCreator } from 'zustand/vanilla';
import { DAppStoreState, MutatorsIn } from 'store/store.types';
import { AccountSliceType } from './account.types';
import { emptyAccount } from './emptyAccount';

export const initialState: AccountSliceType = {
  address: '',
  websocketEvent: null,
  websocketBatchEvent: null,
  accounts: { '': emptyAccount },
  ledgerAccount: null,
  publicKey: '',
  walletConnectAccount: null
};

function getAccountSlice(): StateCreator<
  DAppStoreState,
  MutatorsIn,
  [],
  AccountSliceType
> {
  return () => initialState;
}

export const accountSlice = getAccountSlice();
