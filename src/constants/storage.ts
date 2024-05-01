import { createJSONStorage } from 'zustand/middleware';
import { safeWindow } from './window';

const persistConfig: {
  persistReducersStorageType: 'localStorage' | 'sessionStorage';
} = {
  persistReducersStorageType: 'localStorage'
};

export const storage = safeWindow
  ? createJSONStorage(
      () => safeWindow[persistConfig.persistReducersStorageType]
    )
  : undefined;
