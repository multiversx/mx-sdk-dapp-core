import { Transaction } from '@multiversx/sdk-core';
import { getAreAllTransactionsSignedByGuardian } from './getAreAllTransactionsSignedByGuardian';
import { getAccount } from 'core/methods/account/getAccount';
import { walletAddressSelector } from 'store/selectors';
import { getState } from 'store/store';
import { createCrossWindowProvider } from 'core/providers/helpers/crossWindow/createCrossWindowProvider';

export async function getGuardedTransactions({
  transactions
}: {
  transactions: Transaction[];
}): Promise<Transaction[]> {
  const { isGuarded, address } = getAccount();
  const walletAddress = walletAddressSelector(getState());

  const allSignedByGuardian = getAreAllTransactionsSignedByGuardian({
    isGuarded,
    transactions
  });

  if (!isGuarded || allSignedByGuardian) {
    return transactions;
  }

  const provider = await createCrossWindowProvider({
    address,
    walletAddress
  });
  provider.setShouldShowConsentPopup(true);

  const guardedTransactions = await provider.guardTransactions(transactions);

  return guardedTransactions;
}
