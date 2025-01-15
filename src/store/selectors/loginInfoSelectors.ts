import { StoreType } from 'store/store.types';
import { createDeepEqualSelector } from './helpers';

const loginInfoSelector = ({ loginInfo }: StoreType) => loginInfo;

export const tokenLoginSelector = createDeepEqualSelector(
  loginInfoSelector,
  (state) => state.tokenLogin
);

export const walletConnectLoginSelector = createDeepEqualSelector(
  loginInfoSelector,
  (state) => state.walletConnectLogin
);

export const providerTypeSelector = createDeepEqualSelector(
  loginInfoSelector,
  (state) => state.providerType
);

export const ledgerLoginSelector = createDeepEqualSelector(
  loginInfoSelector,
  (state) => state.ledgerLogin
);
