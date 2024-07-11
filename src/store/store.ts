import { createStore } from 'zustand/vanilla';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { networkConfigSlice } from './slices/network/networkSlice';
import { NetworkSliceType } from './slices/network/networkSlice.types';
import { AccountSliceType } from './slices/account/account.types';
import { accountConfigSlice } from './slices/account/accountSlice';
import { createBoundedUseStore } from './createBoundedStore';

export type StoreType = {
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
  ['zustand/persist', StoreType],
  ['zustand/immer', never]
];

export const store = createStore<StoreType, MutatorsOut>(
  devtools(
    persist(
      immer((...args) => ({
        network: networkConfigSlice(...args),
        account: accountConfigSlice(...args)
      })),
      {
        name: 'sdk-dapp-store',
        storage: createJSONStorage(() => localStorage)
      }
    )
  )
);

export const useDAppStore = createBoundedUseStore(store);
