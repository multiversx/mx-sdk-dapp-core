import { createStore } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { storage } from '../../constants/storage';
import { getKeys } from './helpers/getKeys';
import { getReactStore } from './helpers/getReactStore';
import { GetSetType } from './helpers/types';
import { listenToLogout } from './shared/listenToLogout';

const initialState = {
  ['address']: 'NO_ADDRESS',
  ['setAddress']: (_newAddress: string) => {}
};

type StateType = typeof initialState;

const keys = getKeys(initialState);

const definition = (set: GetSetType<StateType>): StateType => ({
  address: initialState.address,
  setAddress: (newAddress) =>
    set(
      (state) => {
        state.address = newAddress;
      },
      false,
      { type: keys.setAddress }
    )
});

const handleLogout = listenToLogout((state: StateType) => {
  state.setAddress('');
});

// vanilla store
export const accountStore = createStore<StateType>()(
  devtools(
    persist(
      immer((...a) => ({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:next-line
        ...definition(...a),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:next-line
        ...handleLogout(...a)
      })),
      {
        name: 'accountStore',
        storage
      }
    )
  )
);

// react store
export const useAccountStore = getReactStore({
  initialState,
  store: accountStore
});
