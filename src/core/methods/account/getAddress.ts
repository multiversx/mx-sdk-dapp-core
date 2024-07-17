import { addressSelector } from 'store/selectors';
import { getState } from 'store/store';

export function getAddress() {
  return addressSelector(getState());
}
