import { createStore } from 'zustand/vanilla';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { NetworkSliceType } from './slices/network/networkSlice.types';
import { AccountSliceType } from './slices/account/account.types';
import { accountSlice, networkSlice } from './slices';
import { createBoundedUseStore } from './createBoundedStore';
import { InMemoryStorage, defaultStorageCallback, StorageCallback } from './storage';

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

export const createDAppStore = (getStorageCallback: StorageCallback) => createStore<StoreType, MutatorsOut>((
  devtools(
    persist(
      immer((...args) => ({
        network: networkSlice(...args),
        account: accountSlice(...args)
      })),
      {
        name: 'sdk-dapp-store',
        storage: createJSONStorage(getStorageCallback)
      }
    )
  )
));

export type StoreApi = ReturnType<typeof createDAppStore>

let store: StoreApi;

export const getStore = () => {
  if (!store) {
    setDAppStore(createDAppStore(() => new InMemoryStorage()));
  }
  return store;
}

export const setDAppStore = (_store: StoreApi) => {
  store = _store;
}

/**
 * Initialize store with the preferred storage by passing a callback.
 * Default storage is localStorage.
 * You can pass your own storage.
 * Call this function before using store, ideally before app bootstrapping.
 * @param getStorageCallback
 * @default () => localStorage
 * @returns persistent store instance
 * e.g. initStore(() => window.localStorage);
 * e.g. initStore(() => window.sessionStorage);
 * e.g. initStore(() => new InMemoryStorage());
 * */
export const initStore = (getStorageCallback = defaultStorageCallback) => {
  return setDAppStore(createDAppStore(getStorageCallback));
}

export const getState = () => getStore().getState();

export const getStoreHook = () => createBoundedUseStore(getStore());
