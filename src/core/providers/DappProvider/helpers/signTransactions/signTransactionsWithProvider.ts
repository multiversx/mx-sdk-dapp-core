import {
  Address,
  Transaction,
  TransactionOptions,
  TransactionVersion
} from '@multiversx/sdk-core/out';
import { getAccount } from 'core/methods/account/getAccount';
import {
  IProvider,
  ProviderTypeEnum
} from 'core/providers/types/providerFactory.types';
import { setAccountNonce } from 'store/actions';
import { refreshAccount } from 'utils';
import { computeNonces } from '../computeNonces/computeNonces';

export type SignTransactionsOptionsType = {
  skipGuardian?: boolean;
};

type SignTransactionsType = {
  provider: IProvider;
  transactions: Transaction[];
  options?: SignTransactionsOptionsType;
};

export async function signTransactionsWithProvider({
  provider,
  transactions,
  options = {}
}: SignTransactionsType): Promise<Transaction[]> {
  await refreshAccount();
  const { isGuarded, activeGuardianAddress, nonce } = getAccount();
  const isLedger = provider.getType() === ProviderTypeEnum.ledger;

  const transactionsWithComputedNonce = computeNonces({
    latestNonce: nonce,
    transactions
  });

  const transactionsToSign =
    activeGuardianAddress && isGuarded && !options.skipGuardian
      ? transactionsWithComputedNonce?.map((transaction) => {
          transaction.setVersion(TransactionVersion.withTxOptions());
          const txOptions = {
            guarded: true,
            ...(isLedger ? { hashSign: true } : {})
          };
          transaction.setOptions(TransactionOptions.withOptions(txOptions));
          transaction.setGuardian(Address.fromBech32(activeGuardianAddress));

          return transaction;
        })
      : transactionsWithComputedNonce;

  const signedTransactions: Transaction[] =
    (await provider.signTransactions(transactionsToSign)) ?? [];

  setAccountNonce(nonce + signedTransactions.length);

  return signedTransactions;
}
