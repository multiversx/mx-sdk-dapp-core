import axios from 'axios';
import { TRANSACTIONS_ENDPOINT } from 'apiCalls/endpoints';

import { networkSelector } from 'store/selectors';
import { getState } from 'store/store';
import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum
} from 'types/enums.types';
import { ServerTransactionType } from 'types/serverTransactions.types';
import {
  GetTransactionsByHashesReturnType,
  PendingTransactionsType
} from 'types/transactions.types';

export const getTransactionsByHashes = async (
  pendingTransactions: PendingTransactionsType
): Promise<GetTransactionsByHashesReturnType> => {
  const { apiAddress } = networkSelector(getState());
  const hashes = pendingTransactions.map((tx) => tx.hash);

  const { data: responseData } = await axios.get<ServerTransactionType[]>(
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
      (txResponse: ServerTransactionType) => txResponse?.txHash === hash
    );

    return {
      hash,
      data: txOnNetwork?.data ?? '',
      invalidTransaction: txOnNetwork == null,
      status: txOnNetwork?.status as
        | TransactionServerStatusesEnum
        | TransactionBatchStatusesEnum,
      results: txOnNetwork?.results ?? [],
      sender: txOnNetwork?.sender ?? '',
      receiver: txOnNetwork?.receiver ?? '',
      previousStatus,
      hasStatusChanged: Boolean(
        txOnNetwork && txOnNetwork.status !== previousStatus
      )
    };
  });
};
