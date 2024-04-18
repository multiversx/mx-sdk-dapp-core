import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';
import { EnvironmentsEnum } from '../../types/enums.types';

export enum NetworkKeysEnum {
  environment = 'environment',
  setEnvironment = 'setEnvironment'
}

export type NetworkRootState = {
  [NetworkKeysEnum.environment]: EnvironmentsEnum;
  [NetworkKeysEnum.setEnvironment]: (env: EnvironmentsEnum) => void;
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
  [NetworkKeysEnum.environment]: EnvironmentsEnum.devnet,
  [NetworkKeysEnum.setEnvironment]: (env: EnvironmentsEnum) =>
    set((state) => ({
      ...state,
      environment: env
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
