import { Transaction } from '@multiversx/sdk-core';
import { getAreAllTransactionsSignedByGuardian } from './getAreAllTransactionsSignedByGuardian';
import { ProviderFactory } from 'core/providers/ProviderFactory';
import { getAccount } from 'core/methods/account/getAccount';
import { walletAddressSelector } from 'store/selectors';
import { getState } from 'store/store';

export const getGuardedTransactions = async ({
  transactions
}: {
  transactions: Transaction[];
}): Promise<Transaction[]> => {
  const { isGuarded, address } = getAccount();
  const walletAddress = walletAddressSelector(getState());

  const allSignedByGuardian = getAreAllTransactionsSignedByGuardian({
    isGuarded,
    transactions
  });

  if (!isGuarded || (isGuarded && allSignedByGuardian)) {
    return transactions;
  }

  const factory = new ProviderFactory();
  const provider = await factory.createCrossWindowProvider({
    address,
    walletAddress
  });
  provider.setShouldShowConsentPopup(true);

  const guardedTransactions = await provider.guardTransactions(transactions);

  return guardedTransactions;
};
