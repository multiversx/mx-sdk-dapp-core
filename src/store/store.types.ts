import { AccountSliceType } from './slices/account/account.types';
import { LoginInfoSliceType } from './slices/loginInfo/loginInfo.types';
import { NetworkSliceType } from './slices/network/networkSlice.types';

export type StoreType = {
  network: NetworkSliceType;
  account: AccountSliceType;
  loginInfo: LoginInfoSliceType;
};

export type MutatorsIn = [
  ['zustand/devtools', never],
  ['zustand/persist', unknown],
  ['zustand/immer', never]
];

export type MutatorsOut = [
  ['zustand/devtools', never],
  ['zustand/persist', StoreType],
  ['zustand/immer', never]
];
