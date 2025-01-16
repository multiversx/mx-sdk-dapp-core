import isEqual from 'lodash.isequal';
import { createSelectorCreator, lruMemoize } from 'reselect';

export const createDeepEqualSelector = createSelectorCreator({
  memoize: lruMemoize,
  memoizeOptions: {
    equalityCheck: isEqual,
    resultEqualityCheck: isEqual,
    maxSize: 10
  },
  argsMemoize: lruMemoize,
  argsMemoizeOptions: {
    equalityCheck: isEqual,
    resultEqualityCheck: isEqual,
    maxSize: 10
  }
});
