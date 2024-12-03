import axios from 'axios';
import { ServerTransactionType } from 'types';
import { TRANSACTIONS_ENDPOINT } from '../endpoints';
import { getTimeout } from './helpers';

export interface GetTransactionType {
  apiAddress: string;
  apiTimeout?: string | number;
  hash: string;
}

export function getTransactionByHash({
  hash,
  apiAddress,
  apiTimeout
}: GetTransactionType) {
  return axios.get<ServerTransactionType[]>(
    `${apiAddress}/${TRANSACTIONS_ENDPOINT}/${hash}`,
    {
      ...getTimeout(apiTimeout)
    }
  );
}
