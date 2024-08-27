import { CurrentNetworkType } from 'types/network.types';

export interface NetworkSliceType {
  network: CurrentNetworkType;
  customWalletAddress: string;
}
