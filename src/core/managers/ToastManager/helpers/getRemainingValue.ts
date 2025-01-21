import {
  CROSS_SHARD_MAX_TOAST_WIDTH_PERCENT_DECREASE,
  PROGRESS_INTERVAL_DURATION_MS,
  SAME_SHARD_MAX_TOAST_WIDTH_PERCENT_DECREASE
} from 'constants/transactions.constants';
import { progressiveDecrement } from './progressiveDecrement';

interface GetRemainingValuePropsType {
  remaining: number;
  totalSeconds: number;
  isCrossShard: boolean;
}

export const getRemainingValue = ({
  remaining,
  totalSeconds,
  isCrossShard
}: GetRemainingValuePropsType) => {
  const widthPercent = isCrossShard
    ? CROSS_SHARD_MAX_TOAST_WIDTH_PERCENT_DECREASE
    : SAME_SHARD_MAX_TOAST_WIDTH_PERCENT_DECREASE;
  const intervalSec = PROGRESS_INTERVAL_DURATION_MS / 1000;
  const linearDecrease = 1 / (totalSeconds * intervalSec);

  const algoDecrement = Math.min(
    progressiveDecrement(remaining) - 1,
    linearDecrease
  );

  const decrement =
    remaining >= 100 - widthPercent ? linearDecrease : algoDecrement;

  return remaining - decrement;
};
