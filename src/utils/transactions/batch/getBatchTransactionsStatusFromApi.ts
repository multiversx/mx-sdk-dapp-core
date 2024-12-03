import axios from 'axios';
import { TRANSACTIONS_BATCH } from 'apiCalls';
import { BatchTransactionsResponseType } from 'types';
import { networkSelector } from 'store/selectors';
import { getState } from 'store/store';

export interface SendBatchTransactionsParamsType {
  batchId: string;
  address: string;
}

export async function getBatchTransactionsStatusFromApi({
  batchId,
  address
}: SendBatchTransactionsParamsType) {
  const { apiAddress, apiTimeout } = networkSelector(getState());

  const { data } = await axios.get<BatchTransactionsResponseType>(
    `${apiAddress}/${TRANSACTIONS_BATCH}/${address}/${batchId}`,
    {
      timeout: Number(apiTimeout ?? TIMEOUT)
    }
  );

  return data;
}
