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
  TrackedTransactionResultType,
  SignedTransactionType
} from 'types/transactions.types';

export const getTransactionsByHashes = async (
  pendingTransactions: SignedTransactionType[]
): Promise<TrackedTransactionResultType[]> => {
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

  return pendingTransactions.map((transaction) => {
    const txOnNetwork = responseData.find(
      (txResponse: ServerTransactionType) =>
        txResponse?.txHash === transaction.hash
    );

    return {
      ...transaction,
      status: txOnNetwork?.status as
        | TransactionServerStatusesEnum
        | TransactionBatchStatusesEnum,
      invalidTransaction: txOnNetwork == null,
      results: txOnNetwork?.results ?? [],
      previousStatus: transaction.status,
      hasStatusChanged: Boolean(
        txOnNetwork && txOnNetwork.status !== transaction.status
      )
    };
  });
};
