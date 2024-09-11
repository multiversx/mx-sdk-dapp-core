import { Transaction } from '@multiversx/sdk-core/out';
import { AxiosError } from 'axios';
import { sendSignedTransactions } from './sendSignedTransactions';
import { SignedTransactionType } from 'store/slices/transactions/transacitions.types';

export const sendTransactions = async (
  transactions: Transaction[] = []
): Promise<SignedTransactionType[] | null> => {
  if (transactions.length === 0) {
    return null;
  }

  try {
    const sentTransactions = await sendSignedTransactions(transactions);
    return sentTransactions;
  } catch (error) {
    const responseData = <{ message: string }>(
      (error as AxiosError).response?.data
    );
    throw responseData?.message ?? (error as any).message;
  }
};
