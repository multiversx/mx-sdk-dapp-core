import { AccountSliceType } from './slices/account/account.types';
import { NetworkSliceType } from './slices/network/networkSlice.types';

export type DAppStoreState = {
  network: NetworkSliceType;
  account: AccountSliceType;
};

export type MutatorsIn = [
  ['zustand/devtools', never],
  ['zustand/persist', unknown],
  ['zustand/immer', never]
];

export type MutatorsOut = [
  ['zustand/devtools', never],
  ['zustand/persist', DAppStoreState],
  ['zustand/immer', never]
];
