import {
  Transaction,
  TransactionOptions,
  TransactionVersion
} from '@multiversx/sdk-core/out';
import { getAccountProvider } from 'core/providers';
import { getAccount } from '../account/getAccount';

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

  return signedTransactions;

  //   const { needs2FaSigning, sendTransactionsToGuardian } =
  //     checkNeedsGuardianSigning({
  //       transactions: signedTransactions,
  //       sessionId,
  //       callbackRoute,
  //       isGuarded: isGuarded && allowGuardian,
  //       walletAddress
  //     });

  //   if (needs2FaSigning) {
  //     return sendTransactionsToGuardian();
  //   }
};
