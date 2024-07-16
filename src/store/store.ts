import { createStore } from 'zustand/vanilla';
import {
  createJSONStorage,
  devtools,
  persist,
  subscribeWithSelector
} from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { networkSlice } from './slices/network/networkSlice';
import { accountSlice } from './slices/account/accountSlice';
import { createBoundedUseStore } from './createBoundedStore';
import { loginInfoSlice } from './slices/loginInfo';
import { StoreType } from './store.types';

export type MutatorsIn = [
  ['zustand/subscribeWithSelector', never],
  ['zustand/devtools', never],
  ['zustand/persist', unknown],
  ['zustand/immer', never]
];

export type MutatorsOut = [
  ['zustand/subscribeWithSelector', never],
  ['zustand/devtools', never],
  ['zustand/persist', StoreType],
  ['zustand/immer', never]
];

export const store = createStore<StoreType, MutatorsOut>(
  subscribeWithSelector(
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
  )
);

export const getState = () => store.getState();

export const useStore = createBoundedUseStore(store);
