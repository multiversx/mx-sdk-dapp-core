import { StoreType } from 'store/store.types';
import { createDeepEqualSelector } from './helpers';

const configSelector = ({ config }: StoreType) => config;

export const nativeAuthConfigSelector = createDeepEqualSelector(
  configSelector,
  (state) => state.nativeAuthConfig
);

export const walletConnectConfigSelector = createDeepEqualSelector(
  configSelector,
  (state) => state.walletConnectConfig
);

export const crossWindowConfigSelector = createDeepEqualSelector(
  configSelector,
  (state) => state.crossWindowConfig
);
