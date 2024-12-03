import axios from 'axios';
import { TRANSACTIONS_ENDPOINT } from 'apiCalls/endpoints';
import { ServerTransactionType } from 'types';
import { GetTransactionsParamsType } from './types/getTransactions.types';
import { getTimeout, getTransactionsParams } from './helpers';

export function getTransactionsByParams(params: GetTransactionsParamsType) {
  const parsedParams = getTransactionsParams(params);

  return axios.get<ServerTransactionType[]>(
    `${params.apiAddress}/${TRANSACTIONS_ENDPOINT}`,
    {
      params: parsedParams,
      ...getTimeout(params.apiTimeout)
    }
  );
}
