import { Transaction } from '@multiversx/sdk-core';
import { getAccount } from 'core/methods/account/getAccount';
import { CrossWindowProviderStrategy } from 'core/providers-strategy/CrossWindowProviderStrategy';
import { getAreAllTransactionsSignedByGuardian } from './getAreAllTransactionsSignedByGuardian';

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

  const providerInstance = new CrossWindowProviderStrategy(address);
  const provider = await providerInstance.createCrowssWindowProvider();
  provider.setShouldShowConsentPopup(true);

  const guardedTransactions = await provider.guardTransactions(transactions);

  return guardedTransactions;
}
