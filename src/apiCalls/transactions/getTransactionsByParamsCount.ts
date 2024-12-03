import axios from 'axios';
import { TRANSACTIONS_COUNT_ENDPOINT } from 'apiCalls/endpoints';
import { GetTransactionsParamsType } from './types/getTransactions.types';
import { getTimeout, getTransactionsParams } from './helpers';

export function getTransactionsByParamsCount(
  params: GetTransactionsParamsType
) {
  const parsedParams = getTransactionsParams(params);

  return axios.get<number>(
    `${params.apiAddress}/${TRANSACTIONS_COUNT_ENDPOINT}`,
    {
      params: parsedParams,
      ...getTimeout(params.apiTimeout)
    }
  );
}
