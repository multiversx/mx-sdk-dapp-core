import { removeTransactionToast } from 'store/actions/toasts/toastsActions';

interface IToastProgressManagerParams {
  successfulToastLifetime?: number;
}

export class LifetimeManager {
  // eslint-disable-next-line no-undef
  private timeoutIntervals: Map<string, NodeJS.Timeout> = new Map();
  private successfulToastLifetime?: number;

  constructor({ successfulToastLifetime }: IToastProgressManagerParams = {}) {
    this.successfulToastLifetime = successfulToastLifetime;
  }

  public start = (toastId: string) => {
    if (this.timeoutIntervals.has(toastId)) {
      return;
    }

    const timeout = setTimeout(() => {
      removeTransactionToast(toastId);
    }, this.successfulToastLifetime);

    this.timeoutIntervals.set(toastId, timeout);
  };

  public stop = (toastId: string) => {
    const timeout = this.timeoutIntervals.get(toastId);
    if (timeout) {
      clearInterval(timeout);
      this.timeoutIntervals.delete(toastId);
    }
  };

  public destroy() {
    this.timeoutIntervals.forEach((interval) => clearInterval(interval));
    this.timeoutIntervals.clear();
  }
}
