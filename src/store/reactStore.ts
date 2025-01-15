import { createBoundedUseStore } from './createBoundedStore';
import { getStore } from './store';
import { StoreType } from './store.types';

let reactStoreInstance: {
  (): StoreType;
  <T>(selector: (state: StoreType) => T): T;
};

export const getReactStore = () => {
  if (reactStoreInstance) {
    return reactStoreInstance;
  }
  reactStoreInstance = createBoundedUseStore(getStore());
  return reactStoreInstance;
};
