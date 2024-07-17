import { NetworkType } from 'types/network.types';
import { getStore } from '../../store';

export const initializeNetworkConfig = (newNetwork: NetworkType) =>
  getStore().setState(({ network: state }) => {
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
  getStore().setState(({ network: state }) => {
    state.network.customWalletAddress = customWalletAddress;
  });

export { initializeNetwork } from './initializeNetwork';
