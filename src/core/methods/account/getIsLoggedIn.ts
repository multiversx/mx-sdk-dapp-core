import { getAddress } from './getAddress';

export function getIsLoggedIn() {
  return Boolean(getAddress());
}
