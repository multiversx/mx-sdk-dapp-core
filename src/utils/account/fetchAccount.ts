import { getAccountFromApi } from 'apiCalls/account/getAccountFromApi';

export const fetchAccount = (address?: string) => getAccountFromApi(address);
