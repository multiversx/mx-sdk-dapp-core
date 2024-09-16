import axios from 'axios';
import { TRANSACTIONS_ENDPOINT } from 'apiCalls/endpoints';

import { getState } from 'store/store';
import { networkSelector } from 'store/selectors';
import {
  GetTransactionsByHashesReturnType,
  PendingTransactionsType
} from 'types/transactions.types';

export const getTransactionsByHashes = async (
  pendingTransactions: PendingTransactionsType
): Promise<GetTransactionsByHashesReturnType> => {
  const { apiAddress } = networkSelector(getState());
  const hashes = pendingTransactions.map((tx) => tx.hash);

  const { data: responseData } = await axios.get(
    `${apiAddress}/${TRANSACTIONS_ENDPOINT}`,
    {
      params: {
        hashes: hashes.join(','),
        withScResults: true
      }
    }
  );

  return pendingTransactions.map(({ hash, previousStatus }) => {
    const txOnNetwork = responseData.find(
      (txResponse: any) => txResponse?.txHash === hash
    );

    return {
      hash,
      data: txOnNetwork?.data,
      invalidTransaction: txOnNetwork == null,
      status: txOnNetwork?.status,
      results: txOnNetwork?.results,
      sender: txOnNetwork?.sender,
      receiver: txOnNetwork?.receiver,
      previousStatus,
      hasStatusChanged: txOnNetwork && txOnNetwork.status !== previousStatus
    };
  });
};
