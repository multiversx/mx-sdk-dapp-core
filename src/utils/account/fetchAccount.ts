import { getAccountFromApi } from 'apiCalls/account/getAccountFromApi';

export function fetchAccount(address?: string) {
  return getAccountFromApi(address);
}
