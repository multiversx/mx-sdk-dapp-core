import { StoreType } from 'store/store.types';

export const networkSliceSelector = ({ network }: StoreType) => network;

export const networkSelector = ({ network }: StoreType) => network.network;

export const chainIdSelector = ({ network: { network } }: StoreType) =>
  network.chainId;
