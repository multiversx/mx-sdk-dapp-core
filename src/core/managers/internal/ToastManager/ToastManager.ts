import isEqual from 'lodash.isequal';
import { UITagsEnum } from 'constants/UITags.enum';
import { NotificationsFeedManager } from 'core/managers/NotificationsFeedManager/NotificationsFeedManager';
import { NotificationsFeedEventsEnum } from 'core/managers/NotificationsFeedManager/types';
import { ToastList } from 'lib/sdkDappCoreUi';
import {
  customToastCloseHandlersDictionary,
  customToastComponentDictionary,
  removeAllCustomToasts,
  removeCustomToast,
  removeTransactionToast,
  addTransactionToast
} from 'store/actions/toasts/toastsActions';
import {
  getIsTransactionFailed,
  getIsTransactionSuccessful,
  getIsTransactionTimedOut
} from 'store/actions/transactions/transactionStateByStatus';

import {
  CustomToastType,
  ToastsSliceType
} from 'store/slices/toast/toastSlice.types';
import { getStore } from 'store/store';
import { IEventBus } from 'types/manager.types';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement } from 'utils/createUIElement';
import { createToastsFromTransactions } from './helpers/createToastsFromTransactions';
import { LifetimeManager } from './helpers/LifetimeManager';
import { ITransactionToast, ToastEventsEnum } from './types';

interface IToastManager {
  successfulToastLifetime?: number;
}

export class ToastManager {
  private lifetimeManager: LifetimeManager;
  private isCreatingElement = false;
  private toastsElement: ToastList | null = null;
  private transactionToasts: ITransactionToast[] = [];
  private customToasts: CustomToastType[] = [];
  private successfulToastLifetime?: number;
  private storeToastsSubscription: () => void = () => null;
  private notificationsFeedManager: NotificationsFeedManager;
  private eventBusUnsubscribeFunctions: (() => void)[] = [];
  private eventBus: IEventBus<ITransactionToast[] | CustomToastType[]> | null =
    null;

  store = getStore();

  constructor({ successfulToastLifetime }: IToastManager = {}) {
    this.destroy();
    this.successfulToastLifetime = successfulToastLifetime;

    this.lifetimeManager = new LifetimeManager({
      successfulToastLifetime
    });

    this.notificationsFeedManager = NotificationsFeedManager.getInstance();
  }

  public async init() {
    const { toasts: toastState } = this.store.getState();
    this.refreshTransactionToasts();
    this.updateCustomToastList(toastState);
    await this.loadPendingTransactionsToasts();
    await this.notificationsFeedManager.init();
    await this.subscribeToEventBusNotifications();

    this.storeToastsSubscription = this.store.subscribe(
      (
        { toasts, transactions },
        { toasts: prevToasts, transactions: prevTransactions }
      ) => {
        if (
          !isEqual(prevToasts.transactionToasts, toasts.transactionToasts) ||
          !isEqual(prevTransactions, transactions)
        ) {
          this.refreshTransactionToasts();
        }

        if (!isEqual(prevToasts.customToasts, toasts.customToasts)) {
          this.updateCustomToastList(toasts);
        }
      }
    );
  }

  private handleCompletedTransaction(toastId: string): boolean {
    const { transactions } = this.store.getState();
    const transaction = transactions[toastId];

    if (!transaction) {
      return false;
    }

    const { status } = transaction;
    const isTimedOut = getIsTransactionTimedOut(status);
    const isFailed = getIsTransactionFailed(status);
    const isSuccessful = getIsTransactionSuccessful(status);
    const isCompleted = isFailed || isSuccessful || isTimedOut;

    if (isCompleted) {
      if (this.successfulToastLifetime) {
        this.lifetimeManager.start(toastId);
      }

      return isCompleted;
    }

    this.lifetimeManager.stop(toastId);

    return isCompleted;
  }

  public createTransactionToast(toastId: string, totalDuration: number) {
    addTransactionToast({
      toastId,
      totalDuration
    });

    this.handleCompletedTransaction(toastId);
    this.refreshTransactionToasts();
  }

  public async refreshTransactionToasts() {
    const { toasts } = this.store.getState();
    await this.updateTransactionToastsList(toasts);
  }

  private async updateTransactionToastsList(toastList: ToastsSliceType) {
    const { transactions: transactionsSessions, account } =
      this.store.getState();

    const { pendingTransactionToasts, completedTransactionToasts } =
      await createToastsFromTransactions({
        toastList,
        transactionsSessions,
        account
      });

    this.transactionToasts = [
      ...pendingTransactionToasts,
      ...completedTransactionToasts
    ];

    for (const toast of toastList.transactionToasts) {
      this.handleCompletedTransaction(toast.toastId);
    }

    await this.publishTransactionToasts();
  }

  private async updateCustomToastList(toastList: ToastsSliceType) {
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

      if (toast.duration) {
        this.lifetimeManager.startWithCustomDuration(
          toast.toastId,
          toast.duration
        );
      }
    }
    this.eventBus?.publish(
      ToastEventsEnum.CUSTOM_TOAST_DATA_UPDATE,
      this.customToasts
    );
  }

  private async createToastListElement(): Promise<ToastList | null> {
    if (this.toastsElement) {
      return this.toastsElement;
    }

    if (!this.isCreatingElement) {
      this.isCreatingElement = true;

      this.toastsElement = await createUIElement<ToastList>({
        name: UITagsEnum.TOAST_LIST
      });

      this.isCreatingElement = false;
    }

    return this.toastsElement;
  }

  private handleTransactionToastClose(toastId: string) {
    const { transactions } = this.store.getState();
    const transactionSession = transactions[toastId];

    if (!transactionSession) {
      this.lifetimeManager.stop(toastId);
      removeTransactionToast(toastId);
      return;
    }

    const { status } = transactionSession;
    const isTimedOut = getIsTransactionTimedOut(status);
    const isFailed = getIsTransactionFailed(status);
    const isSuccessful = getIsTransactionSuccessful(status);
    const isCompleted = isFailed || isSuccessful || isTimedOut;

    if (isCompleted) {
      this.lifetimeManager.stop(toastId);
      removeTransactionToast(toastId);
    }
  }

  private async subscribeToEventBusNotifications() {
    const notificationsFeedEventBus =
      await this.notificationsFeedManager.getEventBus();

    if (notificationsFeedEventBus) {
      notificationsFeedEventBus.subscribe(
        NotificationsFeedEventsEnum.CLOSE_NOTIFICATIONS_FEED,
        this.publishTransactionToasts.bind(this)
      );

      this.eventBusUnsubscribeFunctions.push(() => {
        notificationsFeedEventBus.unsubscribe(
          NotificationsFeedEventsEnum.CLOSE_NOTIFICATIONS_FEED,
          this.publishTransactionToasts.bind(this)
        );
      });
    }

    const toastsElement = await this.createToastListElement();
    if (!toastsElement) {
      return;
    }

    this.eventBus = await toastsElement.getEventBus();
    if (!this.eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    this.eventBus.subscribe(
      ToastEventsEnum.CLOSE_TOAST,
      this.handleCloseToast.bind(this)
    );

    this.eventBusUnsubscribeFunctions.push(() => {
      this.eventBus?.unsubscribe(
        ToastEventsEnum.CLOSE_TOAST,
        this.handleCloseToast.bind(this)
      );
    });

    this.eventBus.subscribe(
      ToastEventsEnum.OPEN_NOTIFICATIONS_FEED,
      this.handleOpenNotificationsFeed.bind(this)
    );

    this.eventBusUnsubscribeFunctions.push(() => {
      this.eventBus?.unsubscribe(
        ToastEventsEnum.OPEN_NOTIFICATIONS_FEED,
        this.handleOpenNotificationsFeed.bind(this)
      );
    });
  }

  private async handleOpenNotificationsFeed() {
    const eventBus = await this.notificationsFeedManager.getEventBus();
    if (!eventBus) {
      return;
    }

    eventBus.publish(
      NotificationsFeedEventsEnum.PENDING_TRANSACTIONS_UPDATE,
      this.transactionToasts
    );

    this.transactionToasts = [];
    this.eventBus?.publish(
      ToastEventsEnum.TRANSACTION_TOAST_DATA_UPDATE,
      this.transactionToasts
    );

    this.notificationsFeedManager.openNotificationsFeed();
  }

  private handleCloseToast(toastId: string) {
    const customToast = this.customToasts.find(
      (toast) => toast.toastId === toastId
    );

    if (customToast) {
      this.lifetimeManager.stop(toastId);
      const handleClose = customToastCloseHandlersDictionary[toastId];
      handleClose?.();
      removeCustomToast(toastId);
      return;
    }

    this.handleTransactionToastClose(toastId);
  }

  private async publishTransactionToasts() {
    if (this.notificationsFeedManager.isNotificationsFeedOpen()) {
      return;
    }

    if (!this.eventBus) {
      const toastsElement = await this.createToastListElement();

      if (!toastsElement) {
        return;
      }

      this.eventBus = await toastsElement.getEventBus();
    }

    this.eventBus.publish(
      ToastEventsEnum.TRANSACTION_TOAST_DATA_UPDATE,
      this.transactionToasts
    );
  }

  private async loadPendingTransactionsToasts() {
    const {
      transactions: transactionsSessions,
      toasts,
      account
    } = this.store.getState();

    const { pendingTransactionToasts, completedTransactionToasts } =
      await createToastsFromTransactions({
        toastList: toasts,
        transactionsSessions,
        account
      });

    const hasNewToastsToShow =
      pendingTransactionToasts.length > 0 ||
      completedTransactionToasts.length > 0;
    if (!hasNewToastsToShow) {
      return;
    }

    const existingToastIds = toasts.transactionToasts.map(
      (toast) => toast.toastId
    );

    for (const pendingToast of pendingTransactionToasts) {
      const { toastId } = pendingToast;
      const hasExistingToast = existingToastIds.includes(toastId);

      if (!hasExistingToast) {
        addTransactionToast({
          toastId,
          totalDuration: this.successfulToastLifetime || 10000
        });
      }
    }

    for (const completedToast of completedTransactionToasts) {
      const { toastId } = completedToast;

      this.handleCompletedTransaction(toastId);
    }

    await this.refreshTransactionToasts();
  }

  public destroy() {
    this.storeToastsSubscription();
    this.lifetimeManager?.destroy();
    this.notificationsFeedManager?.destroy();
    removeAllCustomToasts();
    this.eventBusUnsubscribeFunctions.forEach((unsubscribe) => unsubscribe());
    this.eventBusUnsubscribeFunctions = [];
  }
}
