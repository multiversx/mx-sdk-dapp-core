import { AccountType } from 'types/account.types';
import { getActions } from '../helpers';
import { getVanillaStore } from '../helpers/getVanillaStore';
import { getReactStore } from './../helpers/getReactStore';
import { GetSetType } from './../helpers/types';
import { listenToLogout } from './../shared/listenToLogout';
import {
  AccountSliceType,
  BatchTransactionsWSResponseType,
  LedgerAccountType
} from './account.types';
import { emptyAccount } from './emptyAccount';
import { listenToLogin } from '../shared/listenToLogin';
import { Address } from '@multiversx/sdk-core/out';

const initialData: AccountSliceType = {
  address: '',
  websocketEvent: null,
  websocketBatchEvent: null,
  accounts: { '': emptyAccount },
  ledgerAccount: null,
  publicKey: '',
  walletConnectAccount: null
};

const actions = {
  setAddress: (_address: string) => {},
  setAccount: (_account: AccountType) => {},
  setLedgerAccount: (_ledgerAccount: LedgerAccountType | null) => {},
  updateLedgerAccount: (_ledgerAccount: {
    index: LedgerAccountType['index'];
    address: LedgerAccountType['address'];
  }) => {},
  setWalletConnectAccount: (_walletConnectAccount: string | null) => {},
  setWebsocketEvent: (_message: string) => {},
  setWebsocketBatchEvent: (_data: BatchTransactionsWSResponseType) => {}
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
      setAddress: (state, address) => {
        state.address = address;
      },
      setAccount: (state, account) => {
        const isSameAddress = state.address === account.address;
        state.accounts = {
          [state.address]: isSameAddress ? account : emptyAccount
        };
      },
      setLedgerAccount: (state, ledgerAccount) => {
        state.ledgerAccount = ledgerAccount;
      },
      updateLedgerAccount: (state, { index, address }) => {
        if (state.ledgerAccount) {
          state.ledgerAccount.address = address;
          state.ledgerAccount.index = index;
        }
      },
      setWalletConnectAccount: (state, walletConnectAccount) => {
        state.walletConnectAccount = walletConnectAccount;
      },
      setWebsocketEvent: (state, message) => {
        state.websocketEvent = {
          timestamp: Date.now(),
          message
        };
      },
      setWebsocketBatchEvent: (state, data) => {
        state.websocketBatchEvent = {
          timestamp: Date.now(),
          data
        };
      }
    })
  };
};

const handleLogout = listenToLogout((state: StateType) => {
  state.setAddress('');
});

const handleLogin = listenToLogin(
  (state: StateType, { detail: { address } }) => {
    state.address = address;
    state.publicKey = new Address(address).hex();
  }
);

export const accountStore = getVanillaStore({
  name: 'accountStore',
  definition,
  middleware: [handleLogout, handleLogin]
});

// react store
export const useAccountStore = getReactStore({
  initialState,
  store: accountStore
});
