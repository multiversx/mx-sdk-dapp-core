import { storage } from 'constants/storage';
import { createStore } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { getActions } from '../helpers';
import { getReactStore } from './../helpers/getReactStore';
import { GetSetType } from './../helpers/types';
import { listenToLogout } from './../shared/listenToLogout';
import { AccountSliceType } from './account.types';
import { emptyAccount } from './emptyAccount';

const initialData: AccountSliceType = {
  ['address']: '',
  ['websocketEvent']: null,
  ['websocketBatchEvent']: null,
  ['accounts']: { '': emptyAccount },
  ['ledgerAccount']: null,
  ['publicKey']: '',
  ['walletConnectAccount']: null
};

const actions = {
  ['setAddress']: (_address: string) => {}
};

const initialState = {
  ...initialData,
  ...actions
};

type StateType = typeof initialState;

const definition = (set: GetSetType<StateType>): StateType => {
  const createActions = getActions({ set, actions });

  return {
    ...initialData,
    ...createActions({
      setAddress: (state, newAddress) => {
        state.address = newAddress;
      }
    })
  };
};

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
