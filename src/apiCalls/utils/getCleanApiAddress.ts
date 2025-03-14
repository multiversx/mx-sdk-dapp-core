import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';

export const getCleanApiAddress = (apiAddress: string) => {
  return apiAddress.endsWith('/') ? apiAddress.slice(0, -1) : apiAddress;
};
