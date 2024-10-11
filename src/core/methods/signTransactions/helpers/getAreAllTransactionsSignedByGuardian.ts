import { Transaction } from '@multiversx/sdk-core/out';

interface IGetAreAllTransactionsSignedByGuardian {
  transactions: Transaction[];
  isGuarded?: boolean;
}

export function getAreAllTransactionsSignedByGuardian({
  transactions,
  isGuarded
}: IGetAreAllTransactionsSignedByGuardian) {
  if (!isGuarded) {
    return true;
  }

  if (transactions.length === 0) {
    return false;
  }

  return transactions.every((tx) =>
    Boolean(tx.getGuardianSignature().toString('hex'))
  );
}
