import { produce } from 'immer';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { createStore } from 'zustand/vanilla';
import { CurrentNetworkType, NetworkType } from '../../types/network.types';

export const defaultNetwork: CurrentNetworkType = {
  id: 'not-configured',
  chainId: '',
  name: 'NOT CONFIGURED',
  egldLabel: '',
  decimals: '18',
  digits: '4',
  gasPerDataByte: '1500',
  walletConnectDeepLink: '',
  walletConnectBridgeAddress: '',
  walletConnectV2RelayAddress: '',
  walletConnectV2ProjectId: '',
  walletConnectV2Options: {},
  walletAddress: '',
  apiAddress: '',
  explorerAddress: '',
  apiTimeout: '4000'
};

function getRandomAddressFromNetwork(walletConnectAddresses: string[]) {
  return walletConnectAddresses[
    Math.floor(Math.random() * walletConnectAddresses.length)
  ];
}

export interface NetworkConfigStateType {
  network: CurrentNetworkType;
  chainID: string;
  customWalletAddress?: string;
}

export type NetworkRootState = NetworkConfigStateType & {
  setChainID: (chainID: string) => void;
  setCustomWalletAddress: (customWalletAddress: string) => void;
  initializeNetworkConfig: (network: NetworkType) => void;
};

export const networkStoreDefinition = (
  set: (fn: (state: NetworkRootState) => NetworkRootState) => void
): NetworkRootState => ({
  setChainID: (chainID) =>
    set(
      produce((state) => {
        state.chainID = chainID;
      })
    ),
  setCustomWalletAddress: (customWalletAddress) =>
    set(
      produce((state) => {
        state.network.customWalletAddress = customWalletAddress;
      })
    ),
  initializeNetworkConfig: (newNetwork) => {
    const walletConnectV2RelayAddress = getRandomAddressFromNetwork(
      newNetwork.walletConnectV2RelayAddresses
    );
    const { walletConnectV2RelayAddresses, ...network } = newNetwork;
    set(
      produce((state) => {
        state.network = {
          ...state.network,
          ...network,
          walletConnectV2RelayAddress
        };
      })
    );
  },
  network: defaultNetwork,
  chainID: '-1'
});

export const sessionNetworkStore = createStore<NetworkRootState>()(
  devtools(
    persist(networkStoreDefinition, {
      name: 'sessionNetworkStore',
      storage: createJSONStorage(() => sessionStorage)
    })
  )
);
