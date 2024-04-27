import * as account from './models/account';
import * as network from './models/network';

export const store = {
  [account.namespace]: account.store,
  [network.namespace]: network.store
};

export const keys = {
  [account.namespace]: { ...account.KeysEnum },
  [network.namespace]: { ...network.KeysEnum }
};

export type StoreType = account.RootState & network.RootState;
