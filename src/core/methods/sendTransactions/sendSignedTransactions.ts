import { IPlainTransactionObject, Transaction } from '@multiversx/sdk-core';
import axios from 'axios';
import { networkSelector } from 'store/selectors';
import { SignedTransactionType } from 'store/slices/transactions/transacitions.types';
import { getState } from 'store/store';
import { TransactionServerStatusesEnum } from 'types';

export async function sendSignedTransactions(
  signedTransactions: Transaction[]
): Promise<SignedTransactionType[]> {
  const { apiAddress, apiTimeout } = networkSelector(getState());

  const promises = signedTransactions.map((transaction) => {
    return axios.post(
      `${apiAddress}/transactions`,
      transaction.toPlainObject(),
      { timeout: parseInt(apiTimeout) }
    );
  });

  const response = await Promise.all(promises);

  const sentTransactions: SignedTransactionType[] = response.map(({ data }) => {
    return {
      ...data,
      hash: data.txHash,
      status: TransactionServerStatusesEnum.pending
    };
  });

  return sentTransactions;
}
