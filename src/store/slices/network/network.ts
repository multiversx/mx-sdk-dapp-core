import { storage } from 'constants/storage';
import { NetworkType } from 'types/network.types';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createStore } from 'zustand/vanilla';
import { getKeys } from '../helpers/getKeys';
import { getReactStore } from '../helpers/getReactStore';
import { GetSetType } from '../helpers/types';
import { listenToLogout } from '../shared/listenToLogout';
import { emptyNetwork } from './emptyNetwork';
import { NetworkSliceType } from './network.types';

const initialData: NetworkSliceType = {
  ['network']: emptyNetwork,
  ['customWalletAddress']: ''
};

const actions = {
  ['initializeNetworkConfig']: (_network: NetworkType) => {},
  ['setCustomWalletAddress']: (_customWalletAddress: string) => {}
};

const initialState = {
  ...initialData,
  ...actions
};

type StateType = typeof initialState;

const keys = getKeys(initialState);

const definition = (set: GetSetType<StateType>): StateType => ({
  ...initialData,
  initializeNetworkConfig: (newNetwork) => {
    const walletConnectV2RelayAddress =
      newNetwork.walletConnectV2RelayAddresses[
        Math.floor(
          Math.random() * newNetwork.walletConnectV2RelayAddresses.length
        )
      ];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    )
});

const handleLogout = listenToLogout((state: StateType) => {
  state.setCustomWalletAddress('');
});

// vanilla store
export const networkStore = createStore<StateType>()(
  devtools(
    persist(
      immer((...a) => ({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:next-line
        ...definition(...a),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:next-line
        ...handleLogout(...a)
      })),
      {
        name: 'networkStore',
        storage
      }
    )
  )
);

// react store
export const useNetworkStore = getReactStore({
  initialState,
  store: networkStore
});
