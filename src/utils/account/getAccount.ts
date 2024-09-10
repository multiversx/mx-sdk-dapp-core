import { getAccountFromApi } from 'apiCalls/account/getAccountFromApi';

export const getAccount = (address?: string) => getAccountFromApi(address);
