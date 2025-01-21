import {
  AVERAGE_TX_DURATION_MS,
  CROSS_SHARD_ROUNDS,
  PROGRESS_INTERVAL_DURATION_MS
} from 'constants/transactions.constants';
import {
  deleteToastProgress,
  getToastProgress,
  updateToastProgress
} from 'store/actions/toasts/toastsActions';
import { getUnixTimestamp, getUnixTimestampWithAddedMilliseconds } from 'utils';
import { getRemainingValue } from './getRemainingValue';

interface IToastProgressManagerParams {
  onUpdate: (toastId: string, progress: number) => void;
}

interface IHandleProgressParams {
  toastId: string;
  isCrossShard: boolean;
  isFinished: boolean;
}

export class ProgressManager {
  // eslint-disable-next-line no-undef
  private progressIntervals: Map<string, NodeJS.Timeout> = new Map();
  private onUpdate: (toastId: string, progress: number) => void;

  constructor({ onUpdate }: IToastProgressManagerParams) {
    this.onUpdate = onUpdate;
  }

  public start({ toastId, isCrossShard, isFinished }: IHandleProgressParams) {
    if (isFinished) {
      deleteToastProgress(toastId);
      this.stop(toastId);
      return;
    }

    if (this.progressIntervals.has(toastId)) {
      return;
    }

    const shardAdjustedDuration = isCrossShard
      ? CROSS_SHARD_ROUNDS * AVERAGE_TX_DURATION_MS
      : AVERAGE_TX_DURATION_MS;

    const startTime = getUnixTimestamp();
    const endTime = getUnixTimestampWithAddedMilliseconds(
      shardAdjustedDuration
    );
    const totalSeconds = endTime - startTime;

    let percentRemaining = this.getInitialProgress(toastId);

    const interval = setInterval(() => {
      const value = getRemainingValue({
        remaining: percentRemaining || 100,
        totalSeconds,
        isCrossShard
      });

      percentRemaining = value;
      this.update(toastId, value);
    }, PROGRESS_INTERVAL_DURATION_MS);

    this.progressIntervals.set(toastId, interval);
  }

  public stop(toastId: string) {
    const interval = this.progressIntervals.get(toastId);
    if (interval) {
      clearInterval(interval);
      this.progressIntervals.delete(toastId);
    }
  }

  public getInitialProgress(toastId: string): number {
    return getToastProgress(toastId) || 100;
  }

  private update(toastId: string, progress: number) {
    updateToastProgress(toastId, progress);
    this.onUpdate(toastId, progress);
  }

  public destroy() {
    this.progressIntervals.forEach((interval) => clearInterval(interval));
    this.progressIntervals.clear();
  }
}
