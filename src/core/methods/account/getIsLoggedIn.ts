import { isLoggedInSelector } from 'store/selectors/accountSelectors';
import { getState } from 'store/store';

export function getIsLoggedIn() {
  return isLoggedInSelector(getState());
}
