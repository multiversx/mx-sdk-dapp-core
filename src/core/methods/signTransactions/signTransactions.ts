import {
  Address,
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

export async function signTransactions(
  transactions: Transaction[],
  options: SignTransactionsOptionsType = {}
): Promise<Transaction[]> {
  const provider = getAccountProvider();
  const { isGuarded, activeGuardianAddress } = getAccount();

  const transacitonsToSign =
    activeGuardianAddress && isGuarded && !options.skipGuardian
      ? transactions?.map((transaction) => {
          transaction.setVersion(TransactionVersion.withTxOptions());
          transaction.setOptions(
            TransactionOptions.withOptions({ guarded: true })
          );
          transaction.setGuardian(Address.fromBech32(activeGuardianAddress));
          return transaction;
        })
      : transactions;

  const signedTransactions: Transaction[] =
    (await provider.signTransactions(transacitonsToSign)) ?? [];

  const guardedTransactions = isGuarded
    ? await getGuardedTransactions({ transactions: signedTransactions })
    : signedTransactions;

  return guardedTransactions;
}
