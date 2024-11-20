import { Transaction } from '@multiversx/sdk-core';
import { getAreAllTransactionsSignedByGuardian } from './getAreAllTransactionsSignedByGuardian';
import { getAccount } from 'core/methods/account/getAccount';
import { createCrossWindowProvider } from 'core/providers/helpers/crossWindow/createCrossWindowProvider';

export async function getGuardedTransactions({
  transactions
}: {
  transactions: Transaction[];
}): Promise<Transaction[]> {
  const { isGuarded, address } = getAccount();

  const allSignedByGuardian = getAreAllTransactionsSignedByGuardian({
    isGuarded,
    transactions
  });

  if (!isGuarded || allSignedByGuardian) {
    return transactions;
  }

  const provider = await createCrossWindowProvider({
    address
  });
  provider.setShouldShowConsentPopup(true);

  const guardedTransactions = await provider.guardTransactions(transactions);

  return guardedTransactions;
}
