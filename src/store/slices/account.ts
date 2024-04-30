import { createStore } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
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
export const store = createStore<StateType>()(
  devtools(
    persist(
      immer((...a) => ({
        // @ts-ignore:next-line
        ...definition(...a),
        // @ts-ignore:next-line
        ...handleLogout(...a)
      })),
      {
        name: 'accountStore',
        storage: createJSONStorage(() => sessionStorage)
      }
    )
  )
);

// react store
export const useStore = getReactStore({
  initialState,
  store
});
