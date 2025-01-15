import { StoreType } from 'store/store.types';
import { createDeepEqualSelector } from './helpers';

const networkSliceSelector = ({ network }: StoreType) => network;

export const networkSelector = createDeepEqualSelector(
  networkSliceSelector,
  (state) => state.network
);

export const chainIdSelector = createDeepEqualSelector(
  networkSelector,
  (state) => state.chainId
);

export const walletAddressSelector = createDeepEqualSelector(
  networkSelector,
  (state) => state.walletAddress
);

export const roundDurationSelectorSelector = createDeepEqualSelector(
  networkSelector,
  (state) => state.roundDuration
);
