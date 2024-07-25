import { addressSelector } from 'store/selectors';
import { getState } from 'store/store';

export const getAddress = () => {
  return addressSelector(getState());
};
