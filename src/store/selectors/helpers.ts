import isEqual from 'lodash.isequal';
import { createSelectorCreator, lruMemoize } from 'reselect';

export const createDeepEqualSelector = createSelectorCreator(
  lruMemoize,
  isEqual
);
