import isEqual from 'lodash.isequal';
import { TransactionToastList } from 'lib/sdkDappCoreUi';
import { removeTransactionToast } from 'store/actions/toasts/toastsActions';
import {
  getIsTransactionFailed,
  getIsTransactionPending,
  getIsTransactionSuccessful,
  getIsTransactionTimedOut
} from 'store/actions/trackedTransactions/transactionStateByStatus';
import { accountSelector } from 'store/selectors/accountSelectors';
import { ToastsSliceState } from 'store/slices/toast/toastSlice.types';
import { getStore } from 'store/store';
import { ProviderErrorsEnum } from 'types';
import { createModalElement } from 'utils/createModalElement';
import { getAreTransactionsOnSameShard } from './helpers/getAreTransactionsOnSameShard';
import { getToastDataStateByStatus } from './helpers/getToastDataStateByStatus';
import { getToastProceededStatus } from './helpers/getToastProceededStatus';
import { LifetimeManager } from './helpers/LifetimeManager';
import { ProgressManager } from './helpers/ProgressManager';
import { ITransactionToast, TransactionToastEventsEnum } from './types';

interface IToastManager {
  successfulToastLifetime?: number;
}

export class ToastManager {
  private progressManager: ProgressManager;
  private lifetimeManager: LifetimeManager;
  private transactionToastsElement: TransactionToastList | undefined;
  private transactionToasts: ITransactionToast[] = [];
  private successfulToastLifetime?: number;
  private unsubscribe: () => void = () => null;

  store = getStore();

  constructor({ successfulToastLifetime }: IToastManager = {}) {
    this.successfulToastLifetime = successfulToastLifetime;

    this.progressManager = new ProgressManager({
      onUpdate: this.handleProgressUpdate
    });
    this.lifetimeManager = new LifetimeManager({
      successfulToastLifetime
    });
  }

  public init() {
    const { toasts } = this.store.getState();
    this.onToastListChange(toasts);

    this.unsubscribe = this.store.subscribe(
      (
        { toasts, trackedTransactions },
        { toasts: prevToasts, trackedTransactions: prevTrackedTransactions }
      ) => {
        if (
          !isEqual(prevToasts, toasts) ||
          !isEqual(prevTrackedTransactions, trackedTransactions)
        ) {
          this.onToastListChange(toasts);
        }
      }
    );
  }

  private async onToastListChange(toastList: ToastsSliceState) {
    const { trackedTransactions, account } = this.store.getState();
    this.transactionToasts = [];

    for (const toast of toastList.transactionToasts) {
      const sessionTransactions = trackedTransactions[toast.toastId];
      if (!sessionTransactions) {
        continue;
      }

      const { status, transactions } = sessionTransactions;
      const isPending = getIsTransactionPending(status);
      const isTimedOut = getIsTransactionTimedOut(status);
      const isFailed = getIsTransactionFailed(status);
      const isSuccessful = getIsTransactionSuccessful(status);
      const isCompleted = isFailed || isSuccessful || isTimedOut;

      if (isCompleted && this.successfulToastLifetime) {
        this.lifetimeManager.start(toast.toastId);
      }

      const transactionToast: ITransactionToast = {
        toastDataState: getToastDataStateByStatus({
          address: account.address,
          sender: transactions[0]?.sender,
          toastId: toast.toastId,
          status
        }),
        processedTransactionsStatus: getToastProceededStatus(transactions),
        transactionProgressState: isPending
          ? {
              currentRemaining: this.progressManager.getInitialProgress(
                toast.toastId
              )
            }
          : null,
        toastId: toast.toastId,
        transactions: transactions.map(({ hash, status }) => ({
          hash,
          status
        }))
      };

      this.progressManager.start({
        toastId: toast.toastId,
        isCrossShard: getAreTransactionsOnSameShard(
          transactions,
          accountSelector(this.store.getState())?.shard
        ),
        isFinished: !isPending || isTimedOut
      });

      this.transactionToasts.push(transactionToast);
    }

    await this.renderUIToasts();
  }

  private handleProgressUpdate = (toastId: string, progress: number) => {
    const toastIndex = this.transactionToasts.findIndex(
      (toast) => toast.toastId === toastId
    );
    if (toastIndex !== -1) {
      this.transactionToasts[toastIndex] = {
        ...this.transactionToasts[toastIndex],
        transactionProgressState: { currentRemaining: progress }
      };
      this.renderUIToasts();
    }
  };

  private async renderUIToasts(): Promise<TransactionToastList> {
    if (!this.transactionToastsElement) {
      this.transactionToastsElement =
        await createModalElement<TransactionToastList>(
          'transaction-toast-list'
        );
    }

    const eventBus = await this.transactionToastsElement.getEventBus();

    if (!eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    eventBus.publish(
      TransactionToastEventsEnum.TRANSACTION_TOAST_DATA_UPDATE,
      this.transactionToasts
    );
    eventBus.subscribe(
      TransactionToastEventsEnum.CLOSE_TOAST,
      (toastId: string) => {
        this.progressManager.stop(toastId);
        this.lifetimeManager.stop(toastId);
        removeTransactionToast(toastId);
      }
    );
    return this.transactionToastsElement;
  }

  public destroy() {
    this.unsubscribe();
    this.progressManager.destroy();
    this.lifetimeManager.destroy();
  }
}
