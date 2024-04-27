import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createStore } from 'zustand/vanilla';
import { EnvironmentsEnum } from '../../types/enums.types';
import { GetSetType } from './models.types';

export enum NetworkKeysEnum {
  chainID = 'chainID',
  setChainID = 'setChainID'
}

export type NetworkRootState = {
  [NetworkKeysEnum.chainID]: EnvironmentsEnum;
  [NetworkKeysEnum.setChainID]: (env: EnvironmentsEnum) => void;
};

export const definition = (
  set: GetSetType<NetworkRootState>
): NetworkRootState => ({
  chainID: EnvironmentsEnum.testnet,
  setChainID: (chainID) =>
    set(
      (state) => {
        state.chainID = chainID;
      },
      false,
      { type: NetworkKeysEnum.chainID }
    )
});

export const sessionNetworkStore = createStore<NetworkRootState>()(
  devtools(
    persist(immer(definition), {
      name: 'networkStore',
      storage: createJSONStorage(() => sessionStorage)
    })
  )
);
