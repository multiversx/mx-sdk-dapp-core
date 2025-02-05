import isEqual from 'lodash.isequal';
import { ToastList } from 'lib/sdkDappCoreUi';
import {
  customToastCloseHandlersDictionary,
  customToastComponentDictionary,
  removeAllCustomToasts,
  removeCustomToast,
  removeTransactionToast
} from 'store/actions/toasts/toastsActions';
import {
  getIsTransactionFailed,
  getIsTransactionPending,
  getIsTransactionSuccessful,
  getIsTransactionTimedOut
} from 'store/actions/transactions/transactionStateByStatus';
import { accountSelector } from 'store/selectors/accountSelectors';
import {
  CustomToastType,
  IToastsSliceState
} from 'store/slices/toast/toastSlice.types';
import { getStore } from 'store/store';
import { ProviderErrorsEnum } from 'types';
import { createUIElement } from 'utils/createUIElement';
import { getAreTransactionsOnSameShard } from './helpers/getAreTransactionsOnSameShard';
import { getToastDataStateByStatus } from './helpers/getToastDataStateByStatus';
import { getToastProceededStatus } from './helpers/getToastProceededStatus';
import { LifetimeManager } from './helpers/LifetimeManager';
import { ProgressManager } from './helpers/ProgressManager';
import { ITransactionToast, ToastEventsEnum } from './types';

interface IToastManager {
  successfulToastLifetime?: number;
}

export class ToastManager {
  private progressManager: ProgressManager;
  private lifetimeManager: LifetimeManager;
  private toastsElement: ToastList | undefined;
  private transactionToasts: ITransactionToast[] = [];
  private customToasts: CustomToastType[] = [];
  private successfulToastLifetime?: number;
  private unsubscribe: () => void = () => null;

  store = getStore();

  constructor({ successfulToastLifetime }: IToastManager = {}) {
    this.destroy();
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
    this.updateTransactionToastsList(toasts);
    this.updateCustomToastList(toasts);

    this.unsubscribe = this.store.subscribe(
      (
        { toasts, transactions },
        { toasts: prevToasts, transactions: prevTransactions }
      ) => {
        if (
          !isEqual(prevToasts.transactionToasts, toasts.transactionToasts) ||
          !isEqual(prevTransactions, transactions)
        ) {
          this.updateTransactionToastsList(toasts);
        }

        if (!isEqual(prevToasts.customToasts, toasts.customToasts)) {
          this.updateCustomToastList(toasts);
        }
      }
    );
  }

  private async updateCustomToastList(toastList: IToastsSliceState) {
    this.customToasts = [];
    for (const toast of toastList.customToasts) {
      const isSimpleToast = 'message' in toast;

      const newToast: CustomToastType = isSimpleToast
        ? { ...toast }
        : {
            ...toast,
            instantiateToastElement:
              customToastComponentDictionary[toast.toastId]
          };
      this.customToasts.push(newToast);

      if (!toast.duration) {
        continue;
      }

      this.lifetimeManager.startWithCustomDuration(
        toast.toastId,
        toast.duration
      );
    }

    this.renderCustomToasts();
  }

  private async updateTransactionToastsList(toastList: IToastsSliceState) {
    const { transactions: sessions, account } = this.store.getState();
    this.transactionToasts = [];

    for (const toast of toastList.transactionToasts) {
      const sessionTransactions = sessions[toast.toastId];
      if (!sessionTransactions) {
        continue;
      }

      const { status, transactions, transactionsDisplayInfo } =
        sessionTransactions;
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
          status,
          transactionsDisplayInfo
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

    await this.renderToasts();
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
      this.renderToasts();
    }
  };

  private async renderToasts(): Promise<ToastList> {
    if (!this.toastsElement) {
      this.toastsElement = await createUIElement<ToastList>('toast-list');
    }

    const eventBus = await this.toastsElement.getEventBus();

    if (!eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    eventBus.publish(
      ToastEventsEnum.TRANSACTION_TOAST_DATA_UPDATE,
      this.transactionToasts
    );
    eventBus.subscribe(ToastEventsEnum.CLOSE_TOAST, (toastId: string) => {
      this.progressManager.stop(toastId);
      this.lifetimeManager.stop(toastId);
      removeTransactionToast(toastId);
    });
    return this.toastsElement;
  }

  private async renderCustomToasts(): Promise<ToastList> {
    if (!this.toastsElement) {
      this.toastsElement = await createUIElement<ToastList>('toast-list');
    }

    const eventBus = await this.toastsElement.getEventBus();

    if (!eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    eventBus.publish(
      ToastEventsEnum.CUSTOM_TOAST_DATA_UPDATE,
      this.customToasts
    );
    eventBus.subscribe(ToastEventsEnum.CLOSE_TOAST, (toastId: string) => {
      this.lifetimeManager.stop(toastId);
      const handleClose = customToastCloseHandlersDictionary[toastId];
      handleClose?.();
      removeCustomToast(toastId);
    });
    return this.toastsElement;
  }

  public destroy() {
    this.unsubscribe();
    this.progressManager?.destroy();
    this.lifetimeManager?.destroy();
    removeAllCustomToasts();
  }
}
