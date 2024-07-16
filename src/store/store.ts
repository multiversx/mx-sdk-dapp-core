import { createStore } from 'zustand/vanilla';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { networkSlice } from './slices/network/networkSlice';
import { accountSlice } from './slices/account/accountSlice';
import { createBoundedUseStore } from './createBoundedStore';
import { loginInfoSlice } from './slices/loginInfo';
import { StoreType } from './store.types';
import { applyMiddleware } from './middleware/applyMiddleware';

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
        network: networkSlice(...args),
        account: accountSlice(...args),
        loginInfo: loginInfoSlice(...args)
      })),
      {
        name: 'sdk-dapp-store',
        storage: createJSONStorage(() => localStorage)
      }
    )
  )
);

applyMiddleware(store);

export const getState = () => store.getState();

export const useStore = createBoundedUseStore(store);
