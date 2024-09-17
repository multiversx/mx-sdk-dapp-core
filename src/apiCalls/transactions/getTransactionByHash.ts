import axios from 'axios';
import { TRANSACTIONS_ENDPOINT } from 'apiCalls/endpoints';
import { getState } from 'store/store';
import { networkSelector } from 'store/selectors';
import { ServerTransactionType } from 'types/serverTransactions.types';

export const getTransactionByHash = (hash: string) => {
  const { apiAddress } = networkSelector(getState());

  return axios.get<ServerTransactionType>(
    `${apiAddress}/${TRANSACTIONS_ENDPOINT}/${hash}`,
    {
      timeout: 10000 // 10sec
    }
  );
};
