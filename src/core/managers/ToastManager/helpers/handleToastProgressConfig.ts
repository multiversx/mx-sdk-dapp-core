import {
  AVERAGE_TX_DURATION_MS,
  CROSS_SHARD_ROUNDS
} from 'constants/transactions.constants';
import {
  getToastProgressConfig,
  updateToastProgressConfig
} from 'store/actions/toasts';
import { accountSelector } from 'store/selectors';
import { getStore } from 'store/store';
import { SignedTransactionType } from 'types/transactions.types';
import { getUnixTimestamp, getUnixTimestampWithAddedMilliseconds } from 'utils';
import { getAreTransactionsOnSameShard } from './getAreTransactionsOnSameShard';

export const handleToastProgressConfig = (
  toastId: string,
  transactions: SignedTransactionType[]
) => {
  const progress = getToastProgressConfig(toastId);

  if (progress) {
    return progress;
  }

  const isCrossShard = getAreTransactionsOnSameShard(
    transactions,
    accountSelector(getStore().getState())?.shard
  );

  const shardAdjustedDuration = isCrossShard
    ? CROSS_SHARD_ROUNDS * AVERAGE_TX_DURATION_MS
    : AVERAGE_TX_DURATION_MS;

  const startTime = getUnixTimestamp();
  const endTime = getUnixTimestampWithAddedMilliseconds(shardAdjustedDuration);

  const newProgressConfig = {
    startTime,
    endTime,
    isCrossShard
  };

  updateToastProgressConfig(toastId, newProgressConfig);

  return newProgressConfig;
};
