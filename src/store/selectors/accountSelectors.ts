import { emptyAccount } from 'store/slices/account/emptyAccount';
import { StoreType } from 'store/store.types';
import { createDeepEqualSelector } from './helpers';

const accountInfoSelector = ({ account }: StoreType) => account;

export const addressSelector = createDeepEqualSelector(
  accountInfoSelector,
  (state) => {
    return state.address;
  }
);

const accountSelectorBase = createDeepEqualSelector(
  accountInfoSelector,
  addressSelector,
  ({ accounts }, address) => {
    return address && address in accounts ? accounts[address] : emptyAccount;
  }
);

export const accountSelector = createDeepEqualSelector(
  accountSelectorBase,
  (state) => state
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
  (state) => state.nonce || 0
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
