import { Transaction } from '@multiversx/sdk-core';
import axios from 'axios';
import { networkSelector } from 'store/selectors';
import { getState } from 'store/store';
import { TransactionServerStatusesEnum } from 'types';
import { SignedTransactionType } from 'types/transactions.types';

export const sendSignedTransactions = async (
  signedTransactions: Transaction[]
): Promise<SignedTransactionType[]> => {
  const { apiAddress, apiTimeout } = networkSelector(getState());

  const promises = signedTransactions.map((transaction) => {
    return axios.post(
      `${apiAddress}/transactions`,
      transaction.toPlainObject(),
      { timeout: parseInt(apiTimeout) }
    );
  });

  const response = await Promise.all(promises);

  const sentTransactions: SignedTransactionType[] = [];

  response.forEach(({ data }, i) => {
    const currentTransaction = signedTransactions[i];
    if (currentTransaction.getHash().hex() === data.txHash) {
      sentTransactions.push({
        ...currentTransaction.toPlainObject(),
        hash: data.txHash,
        status: TransactionServerStatusesEnum.pending
      });
    }
  });

  return sentTransactions;
};
