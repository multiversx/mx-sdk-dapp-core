import { StoreType } from '../store';

export const networkSliceSelector = ({ network }: StoreType) => network;

export const networkSelector = ({ network }: StoreType) => network.network;

export const chainIdSelector = ({ network: { network } }: StoreType) =>
  network.chainId;
