import { Transaction } from '@multiversx/sdk-core/out';
import { computeTransactionNonce } from './computeTransactionNonce';

export const computeTransactionsNonce = ({
  latestNonce,
  transactions
}: {
  latestNonce: number;
  transactions: Array<Transaction>;
}): Array<Transaction> => {
  if (transactions.length === 0) {
    return transactions;
  }

  return transactions.map((tx: Transaction, index: number) => {
    const nextNonce = latestNonce + index;

    const transactionNonce = tx.getNonce().valueOf();

    // stop replacing nonce if transaction is configured with a higher nonce than the existing one
    const computedNonce = computeTransactionNonce({
      accountNonce: nextNonce,
      transactionNonce
    });

    tx.setNonce(computedNonce);

    return tx;
  });
};
