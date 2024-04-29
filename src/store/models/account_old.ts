import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createStore } from 'zustand/vanilla';
import { GetSetType } from './helpers';

export interface ICounterState {
  count: number;
  increment: () => void;
}

export const namespace = 'account';

export enum KeysEnum {
  address = 'address',
  setAddress = 'setAddress'
}

export const initialState = {
  [namespace]: {
    [KeysEnum.address]: 'defaultAddress',
    [KeysEnum.setAddress]: (_address: string) => {}
  }
};

export type RootState = typeof initialState;

export const definition = (set: GetSetType<RootState>) => {
  const values: RootState['account'] = {
    address: 'defaultAddress',
    setAddress: (address) =>
      set(
        ({ account }) => {
          account[KeysEnum.address] = address;
        },
        false,
        { type: KeysEnum.setAddress }
      )
  };
  return {
    [namespace]: values
  };
};

export const store = createStore<RootState>()(
  devtools(
    persist(immer(definition), {
      name: 'accountStore',
      storage: createJSONStorage(() => sessionStorage)
    })
  )
);
