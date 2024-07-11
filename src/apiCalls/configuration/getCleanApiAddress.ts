import { networkSelector } from 'store/selectors/networkSelectors';
import { store } from 'store/store';

export const getCleanApiAddress = (customApiAddress?: string) => {
  const network = networkSelector(store.getState());
  const apiAddress = customApiAddress ?? network.apiAddress;
  return apiAddress.endsWith('/') ? apiAddress.slice(0, -1) : apiAddress;
};
