import { isLoggedInSelector } from 'store/selectors/accountSelectors';
import { getAddress } from './getAddress';
import { getState } from 'store/store';

export function getIsLoggedIn() {
  return isLoggedInSelector(getState());
}
