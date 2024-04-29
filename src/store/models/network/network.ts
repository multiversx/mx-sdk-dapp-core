import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createStore } from 'zustand/vanilla';
import { NetworkType } from '../../../types/network.types';
import { defaultNetwork, getRandomAddressFromNetwork } from './helpers';
import { GetSetType } from '../helpers/types';
import { getKeys } from '../helpers/getKeys';
import { getReactStore } from '../helpers/getReactStore';

const initialState = {
  ['network']: defaultNetwork,
  ['customWalletAddress']: '',
  ['chainID']: '-1',
  ['setChainID']: (_chainID: string) => {},
  ['setCustomWalletAddress']: (_customWalletAddress: string) => {},
  ['initializeNetworkConfig']: (_network: NetworkType) => {}
};

type StateType = typeof initialState;

const keys = getKeys(initialState);

const definition = (set: GetSetType<StateType>): StateType => ({
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
});

// vanilla store
export const store = createStore<StateType>()(
  devtools(
    persist(immer(definition), {
      name: 'networkStore',
      storage: createJSONStorage(() => sessionStorage)
    })
  )
);

// react store
export const useStore = getReactStore({
  initialState,
  store
});
