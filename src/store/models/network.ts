import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';
import { EnvironmentsEnum } from '../../types/enums.types';

export enum NetworkKeysEnum {
  chainID = 'chainID',
  setChainID = 'setChainID'
}

export type NetworkRootState = {
  [NetworkKeysEnum.chainID]: EnvironmentsEnum;
  [NetworkKeysEnum.setChainID]: (env: EnvironmentsEnum) => void;
};

export const networkStoreDefinition = (
  set: (
    partial:
      | NetworkRootState
      | Partial<NetworkRootState>
      | ((
          state: NetworkRootState
        ) => NetworkRootState | Partial<NetworkRootState>),
    replace?: boolean | undefined
  ) => void
): NetworkRootState => ({
  [NetworkKeysEnum.chainID]: EnvironmentsEnum.devnet,
  [NetworkKeysEnum.setChainID]: (env: EnvironmentsEnum) =>
    set((state) => ({
      ...state,
      chainID: env
    }))
});

export const sessionNetworkStore = createStore<NetworkRootState>()(
  devtools(
    persist(networkStoreDefinition, {
      name: 'sessionNetworkStore',
      storage: createJSONStorage(() => sessionStorage)
    })
  )
);
