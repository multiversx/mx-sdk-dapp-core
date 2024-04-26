import { combine } from 'zustand/middleware/combine';
import { createStore } from 'zustand/vanilla';
import { sessionNetworkStore } from './models';

export const store = createStore(
  combine(sessionNetworkStore, (sessionNetworkStore) => ({
    ...sessionNetworkStore
  }))
);
