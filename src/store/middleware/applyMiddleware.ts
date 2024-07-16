import { StoreType } from '../store.types';
import { StoreApi } from 'zustand/vanilla';
import { logoutMiddleware } from './logoutMiddleware';

export const applyMiddleware = (store: StoreApi<StoreType>) => {
  store.subscribe(logoutMiddleware);
};
