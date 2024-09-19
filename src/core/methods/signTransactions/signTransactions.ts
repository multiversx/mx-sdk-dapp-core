import {
  Transaction,
  TransactionOptions,
  TransactionVersion
} from '@multiversx/sdk-core/out';
import { getAccountProvider } from 'core/providers';
import { getAccount } from '../account/getAccount';
import { getGuardedTransactions } from './helpers/getGuardedTransactions';

type SignTransactionsOptionsType = {
  skipGuardian?: boolean;
};

export const signTransactions = async (
  transactions: Transaction[],
  options: SignTransactionsOptionsType = {}
): Promise<Transaction[]> => {
  const provider = getAccountProvider();
  const { isGuarded } = getAccount();

  const transacitonsToSign =
    isGuarded && !options.skipGuardian
      ? transactions?.map((transaction) => {
          transaction.setVersion(TransactionVersion.withTxOptions());
          transaction.setOptions(
            TransactionOptions.withOptions({ guarded: true })
          );
          return transaction;
        })
      : transactions;

  const signedTransactions: Transaction[] =
    (await provider.signTransactions(transacitonsToSign)) ?? [];

  const guardedTransactions = isGuarded
    ? await getGuardedTransactions({ transactions: signedTransactions })
    : signedTransactions;

  return guardedTransactions;
};
