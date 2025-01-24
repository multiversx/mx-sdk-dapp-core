import { Transaction } from '@multiversx/sdk-core/out';
import { getAccount } from 'core/methods/account/getAccount';
import { networkSelector } from 'store/selectors';
import { getState } from 'store/store';
import { getCrossWindowProvider } from './getCrossWindowProvider';
import { getTransactionsNeedGuardianSigning } from './getTransactionsNeedGuardianSigning';

/*
  Performs guard transactions if needed
*/
export const guardTransactions = async (transactions: Transaction[]) => {
  const { isGuarded } = getAccount();

  const needs2FAsigning = getTransactionsNeedGuardianSigning({
    isGuarded,
    transactions
  });

  if (!needs2FAsigning) {
    return transactions;
  }

  const sender = transactions[0].getSender().bech32().toString();
  const { walletAddress } = networkSelector(getState());

  console.log('\x1b[42m%s\x1b[0m', 112, isGuarded);

  const provider = await getCrossWindowProvider({
    address: sender,
    walletUrl: walletAddress
  });

  provider?.setShouldShowConsentPopup(true);
  const guardedTransactions = await provider?.guardTransactions(transactions);
  return guardedTransactions || [];
};
