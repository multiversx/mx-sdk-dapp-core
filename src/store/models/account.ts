import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createStore } from 'zustand/vanilla';

export interface ICounterState {
  count: number;
  increment: () => void;
}

export const namespace = 'account';

export enum AddressKeysEnum {
  address = 'address',
  setAddress = 'setAddress'
}

interface AddressConfigStateType {
  [AddressKeysEnum.address]: string;
}

interface AddressModifiersType {
  [AddressKeysEnum.setAddress]: (address: string) => void;
}

export type NetworkRootState = {
  [namespace]: AddressConfigStateType & AddressModifiersType;
};

export const store = createStore<NetworkRootState>()(
  devtools(
    persist(
      immer((set) => ({
        [namespace]: {
          address: 'defaultAddress',
          setAddress: (address) =>
            set(
              ({ account }) => {
                account[AddressKeysEnum.address] = address;
              },
              false,
              { type: AddressKeysEnum.setAddress }
            )
        }
      })),
      {
        name: 'accountStore',
        storage: createJSONStorage(() => sessionStorage)
      }
    )
  )
);
