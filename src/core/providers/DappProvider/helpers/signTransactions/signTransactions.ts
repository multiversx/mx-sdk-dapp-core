import {
  Address,
  Transaction,
  TransactionOptions,
  TransactionVersion
} from '@multiversx/sdk-core/out';
import { getAccount } from 'core/methods/account/getAccount';
import { IProvider } from 'core/providers/types/providerFactory.types';

export type SignTransactionsOptionsType = {
  skipGuardian?: boolean;
};

type SignTransactionsType = {
  provider: IProvider;
  transactions: Transaction[];
  options?: SignTransactionsOptionsType;
};

export async function signTransactions({
  provider,
  transactions,
  options = {}
}: SignTransactionsType): Promise<Transaction[]> {
  const { isGuarded, activeGuardianAddress } = getAccount();

  const transactionsToSign =
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
    (await provider.signTransactions(transactionsToSign)) ?? [];

  return signedTransactions;
}
