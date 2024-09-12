import { AccountSliceType } from './slices/account/account.types';
import { LoginInfoSliceType } from './slices/loginInfo/loginInfo.types';
import { NetworkSliceType } from './slices/network/networkSlice.types';
import { ConfigSliceType } from './slices/config/config.types';
import { TransactionsSliceType } from './slices/transactions/transacitionsSlice.types';

export type StoreType = {
  network: NetworkSliceType;
  account: AccountSliceType;
  loginInfo: LoginInfoSliceType;
  config: ConfigSliceType;
  transactions: TransactionsSliceType;
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
