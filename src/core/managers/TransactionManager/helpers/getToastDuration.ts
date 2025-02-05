import { Transaction } from '@multiversx/sdk-core/out';
import { getAreTransactionsOnSameShard } from './getAreTransactionsOnSameShard';
import { getState } from 'store/store';
import { accountSelector } from 'store/selectors';
import { isBatchTransaction } from './isBatchTransaction';
import {
  AVERAGE_TX_DURATION_MS,
  CROSS_SHARD_ROUNDS
} from 'constants/transactions.constants';
import { SignedTransactionType } from 'types/transactions.types';

export const getToastDuration = (
  transactions: SignedTransactionType[] | SignedTransactionType[][]
) => {
  let totalDuration = 0;
  const accountShard = accountSelector(getState())?.shard;

  if (isBatchTransaction(transactions)) {
    transactions.forEach((transactionGroup) => {
      const isCrossShard = getAreTransactionsOnSameShard(
        transactionGroup,
        accountShard
      );
      totalDuration += isCrossShard
        ? CROSS_SHARD_ROUNDS * AVERAGE_TX_DURATION_MS
        : AVERAGE_TX_DURATION_MS;
    });
    return totalDuration;
  }

  const isCrossShard = getAreTransactionsOnSameShard(
    transactions,
    accountShard
  );
  totalDuration = isCrossShard
    ? CROSS_SHARD_ROUNDS * AVERAGE_TX_DURATION_MS
    : AVERAGE_TX_DURATION_MS;

  return totalDuration;
};
