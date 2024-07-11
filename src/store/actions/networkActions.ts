import { NetworkType } from 'types/network.types';
import { store } from '../store';

export const initializeNetwork = (newNetwork: NetworkType) =>
  store.setState(({ network: state }) => {
    const walletConnectV2RelayAddress =
      newNetwork.walletConnectV2RelayAddresses[
        Math.floor(
          Math.random() * newNetwork.walletConnectV2RelayAddresses.length
        )
      ];
    const { walletConnectV2RelayAddresses, ...rest } = newNetwork;

    state.network = {
      ...state.network,
      ...rest,
      walletConnectV2RelayAddress
    };
  });

export const setCustomWalletAddress = (customWalletAddress: string) =>
  store.setState(({ network: state }) => {
    state.network.customWalletAddress = customWalletAddress;
  });
