import { StoreType } from 'store/store.types';
import { createDeepEqualSelector } from './helpers';

export const stateSelector = createDeepEqualSelector(
  (state: StoreType) => state,
  (state) => state
);
