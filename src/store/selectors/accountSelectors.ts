import { emptyAccount } from 'store/slices/account/emptyAccount';
import { StoreType } from 'store/store.types';
import { createDeepEqualSelector } from './helpers';

const accountInfoSelector = ({ account }: StoreType) => account;

export const addressSelector = createDeepEqualSelector(
  ({ account }: StoreType) => account.address,
  (state) => state
);

export const accountSelector = createDeepEqualSelector(
  accountInfoSelector,
  addressSelector,
  (state, address) =>
    address in state.accounts ? state.accounts[address] : emptyAccount
);

export const websocketEventSelector = createDeepEqualSelector(
  accountInfoSelector,
  (state) => state.websocketEvent
);

export const websocketBatchEventSelector = createDeepEqualSelector(
  accountInfoSelector,
  (state) => state.websocketBatchEvent
);

export const accountNonceSelector = createDeepEqualSelector(
  accountSelector,
  (state) => state?.nonce?.valueOf() || 0
);

export const shardSelector = createDeepEqualSelector(
  accountSelector,
  (state) => state.shard
);

export const isLoggedInSelector = createDeepEqualSelector(
  accountSelector,
  addressSelector,
  (account, address) => Boolean(address && account?.address === address)
);
