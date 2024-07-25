import { getAddress } from './getAddress';

export const getIsLoggedIn = () => {
  return Boolean(getAddress());
};
