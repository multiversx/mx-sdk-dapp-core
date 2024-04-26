import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
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

export const namespace = 'network';

export enum NetworkKeysEnum {
  network = 'network',
  chainID = 'chainID',
  customWalletAddress = 'customWalletAddress',
  setChainID = 'setChainID',
  setCustomWalletAddress = 'setCustomWalletAddress',
  initializeNetworkConfig = 'initializeNetworkConfig'
}

interface NetworkConfigStateType {
  [NetworkKeysEnum.network]: CurrentNetworkType;
  [NetworkKeysEnum.chainID]: string;
  [NetworkKeysEnum.customWalletAddress]?: string;
}

interface NetworkModifiersType {
  [NetworkKeysEnum.setChainID]: (chainID: string) => void;
  [NetworkKeysEnum.setCustomWalletAddress]: (
    customWalletAddress: string
  ) => void;
  [NetworkKeysEnum.initializeNetworkConfig]: (network: NetworkType) => void;
}

export type NetworkRootState = {
  [namespace]: NetworkConfigStateType & NetworkModifiersType;
};

export const store = createStore<NetworkRootState>()(
  devtools(
    persist(
      immer((set) => ({
        [namespace]: {
          network: defaultNetwork,
          chainID: '-1',
          initializeNetworkConfig: (newNetwork) => {
            const walletConnectV2RelayAddress = getRandomAddressFromNetwork(
              newNetwork.walletConnectV2RelayAddresses
            );
            const { walletConnectV2RelayAddresses, ...rest } = newNetwork;
            return set(
              ({ network }) => {
                network[NetworkKeysEnum.network] = {
                  ...network[NetworkKeysEnum.network],
                  ...rest,
                  walletConnectV2RelayAddress
                };
              },
              false,
              { type: NetworkKeysEnum.initializeNetworkConfig }
            );
          },
          setCustomWalletAddress: (customWalletAddress) =>
            set(
              ({ network }) => {
                network[NetworkKeysEnum.network].customWalletAddress =
                  customWalletAddress;
              },
              false,
              { type: NetworkKeysEnum.setCustomWalletAddress }
            ),
          setChainID: (chainID) =>
            set(
              ({ network }) => {
                network[NetworkKeysEnum.chainID] = chainID;
              },
              false,
              { type: NetworkKeysEnum.setChainID }
            )
        }
      })),
      {
        name: 'networkStore',
        storage: createJSONStorage(() => sessionStorage)
      }
    )
  )
);
