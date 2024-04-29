import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createStore } from 'zustand/vanilla';
import { NetworkType } from '../../../types/network.types';
import { GetSetType, getKeys } from './../helpers';
import { defaultNetwork, getRandomAddressFromNetwork } from './helpers';

export const namespace = 'network';

export const initialState = {
  network: defaultNetwork,
  customWalletAddress: '',
  chainID: '-1',
  setChainID: (_chainID: string) => {},
  setCustomWalletAddress: (_customWalletAddress: string) => {},
  initializeNetworkConfig: (_network: NetworkType) => {}
};

export const keys = getKeys(initialState);

export type RootState = typeof initialState;

export const definition = (set: GetSetType<RootState>): RootState => {
  return {
    network: initialState.network,
    customWalletAddress: initialState.customWalletAddress,
    chainID: initialState.chainID,
    initializeNetworkConfig: (newNetwork) => {
      const walletConnectV2RelayAddress = getRandomAddressFromNetwork(
        newNetwork.walletConnectV2RelayAddresses
      );
      const { walletConnectV2RelayAddresses, ...rest } = newNetwork;
      return set(
        (state) => {
          state[keys.network] = {
            ...state[keys.network],
            ...rest,
            walletConnectV2RelayAddress
          };
        },
        false,
        { type: keys.initializeNetworkConfig }
      );
    },
    setCustomWalletAddress: (customWalletAddress) =>
      set(
        (state) => {
          state[keys.network].customWalletAddress = customWalletAddress;
        },
        false,
        { type: keys.setCustomWalletAddress }
      ),
    setChainID: (chainID) =>
      set(
        (state) => {
          state[keys.chainID] = chainID;
        },
        false,
        { type: keys.setChainID }
      )
  };
};

export const store = createStore<RootState>()(
  devtools(
    persist(immer(definition), {
      name: namespace,
      storage: createJSONStorage(() => sessionStorage)
    })
  )
);
