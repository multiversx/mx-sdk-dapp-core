import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createStore } from 'zustand/vanilla';
import { CurrentNetworkType, NetworkType } from '../../types/network.types';
import { GetSetType } from './models.types';

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

export enum KeysEnum {
  network = 'network',
  chainID = 'chainID',
  customWalletAddress = 'customWalletAddress',
  setChainID = 'setChainID',
  setCustomWalletAddress = 'setCustomWalletAddress',
  initializeNetworkConfig = 'initializeNetworkConfig'
}

export const namespace = 'network';

export const initialState = {
  network: defaultNetwork,
  chainID: '-1',
  setChainID: (_chainID: string) => {},
  setCustomWalletAddress: (_customWalletAddress: string) => {},
  initializeNetworkConfig: (_network: NetworkType) => {}
};

export type RootState = typeof initialState;

export const definition = (set: GetSetType<RootState>): RootState => ({
  network: defaultNetwork,
  chainID: '-1',
  initializeNetworkConfig: (newNetwork) => {
    const walletConnectV2RelayAddress = getRandomAddressFromNetwork(
      newNetwork.walletConnectV2RelayAddresses
    );
    const { walletConnectV2RelayAddresses, ...rest } = newNetwork;
    return set(
      (state) => {
        state[KeysEnum.network] = {
          ...state[KeysEnum.network],
          ...rest,
          walletConnectV2RelayAddress
        };
      },
      false,
      { type: KeysEnum.initializeNetworkConfig }
    );
  },
  setCustomWalletAddress: (customWalletAddress) =>
    set(
      (state) => {
        state[KeysEnum.network].customWalletAddress = customWalletAddress;
      },
      false,
      { type: KeysEnum.setCustomWalletAddress }
    ),
  setChainID: (chainID) =>
    set(
      (state) => {
        state[KeysEnum.chainID] = chainID;
      },
      false,
      { type: KeysEnum.setChainID }
    )
});

export const store = createStore<RootState>()(
  devtools(
    persist(immer(definition), {
      name: namespace,
      storage: createJSONStorage(() => sessionStorage)
    })
  )
);
