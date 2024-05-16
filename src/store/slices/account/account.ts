import { getActions } from '../helpers';
import { getReactStore } from './../helpers/getReactStore';
import { GetSetType } from './../helpers/types';
import { listenToLogout } from './../shared/listenToLogout';
import { AccountSliceType } from './account.types';
import { emptyAccount } from './emptyAccount';
import { getVanillaStore } from '../helpers/getVanillaStore';

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

export const accountStore = getVanillaStore({
  name: 'accountStore',
  definition,
  middleware: [handleLogout]
});

// react store
export const useAccountStore = getReactStore({
  initialState,
  store: accountStore
});
