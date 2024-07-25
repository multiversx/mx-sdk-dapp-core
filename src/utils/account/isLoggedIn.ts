import { getAddress } from './getAddress';

export const isLoggedIn = () => {
  return Boolean(getAddress());
};
