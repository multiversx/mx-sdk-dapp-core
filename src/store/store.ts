import { account, network } from './models';

export const store = {
  [account.namespace]: account.store,
  [network.namespace]: network.store
};
