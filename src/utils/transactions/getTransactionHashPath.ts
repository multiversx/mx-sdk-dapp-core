import { ServerTransactionType } from 'types/serverTransactions.types';

export const getTransactionHashPath = (transaction: ServerTransactionType) =>
  `/transactions/${
    transaction.originalTxHash
      ? `${transaction.originalTxHash}#${transaction.txHash}`
      : transaction.txHash
  }`;
