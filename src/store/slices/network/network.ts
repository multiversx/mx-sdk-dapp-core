import { NetworkType } from 'types/network.types';
import { getActions } from '../helpers';
import { getKeys } from '../helpers/getKeys';
import { getReactStore } from '../helpers/getReactStore';
import { getVanillaStore } from '../helpers/getVanillaStore';
import { GetSetType } from '../helpers/types';
import { listenToLogout } from '../shared/listenToLogout';
import { emptyNetwork } from './emptyNetwork';
import { NetworkSliceType } from './network.types';

const initialData: NetworkSliceType = {
  network: emptyNetwork,
  customWalletAddress: ''
};

const actions = {
  initializeNetworkConfig: (_network: NetworkType) => {},
  setCustomWalletAddress: (_customWalletAddress: string) => {}
};

const initialState = {
  ...initialData,
  ...actions
};

type StateType = typeof initialState;

const keys = getKeys(initialState);

const definition = (set: GetSetType<StateType>): StateType => {
  const createActions = getActions({ set, actions });

  return {
    ...initialData,
    ...createActions({
      initializeNetworkConfig: (state, newNetwork) => {
        const walletConnectV2RelayAddress =
          newNetwork.walletConnectV2RelayAddresses[
            Math.floor(
              Math.random() * newNetwork.walletConnectV2RelayAddresses.length
            )
          ];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { walletConnectV2RelayAddresses, ...rest } = newNetwork;
        state[keys.network] = {
          ...state[keys.network],
          ...rest,
          walletConnectV2RelayAddress
        };
      },
      setCustomWalletAddress: (state, customWalletAddress) => {
        state[keys.network].customWalletAddress = customWalletAddress;
      }
    })
  };
};

const handleLogout = listenToLogout((state: StateType) => {
  state.setCustomWalletAddress('');
});

export const networkStore = getVanillaStore({
  name: 'networkStore',
  definition,
  middleware: [handleLogout]
});

// react store
export const useNetworkStore = getReactStore({
  initialState,
  store: networkStore
});
