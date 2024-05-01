import { store } from '../network';

export const getCleanApiAddress = (customApiAddress?: string) => {
  const { network } = store.getState();
  const apiAddress = customApiAddress ?? network.apiAddress;
  return apiAddress.endsWith('/') ? apiAddress.slice(0, -1) : apiAddress;
};
