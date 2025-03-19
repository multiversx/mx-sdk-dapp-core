import isEqual from 'lodash.isequal';
import { UITagsEnum } from 'constants/UITags.enum';
import { NotificationsFeedManager } from 'core/managers/NotificationsFeedManager/NotificationsFeedManager';
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
  getIsTransactionSuccessful,
  getIsTransactionTimedOut
} from 'store/actions/transactions/transactionStateByStatus';

import {
  CustomToastType,
  ToastsSliceType
} from 'store/slices/toast/toastSlice.types';
import { getStore } from 'store/store';
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
    const { toasts } = this.store.getState();
    this.updateTransactionToastsList(toasts);
    this.updateCustomToastList(toasts);

    await this.notificationsFeedManager.init();

    this.storeToastsSubscription = this.store.subscribe(
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

    this.renderCustomToasts();
  }

  private async updateTransactionToastsList(toastList: ToastsSliceType) {
    const { transactions: sessions, account } = this.store.getState();

    const { pendingTransactions } = createToastsFromTransactions({
      toastList,
      sessions,
      account
    });

    this.transactionToasts = pendingTransactions;

    for (const toast of toastList.transactionToasts) {
      const sessionTransactions = sessions[toast.toastId];
      if (!sessionTransactions) {
        continue;
      }

      const { toastId } = toast;
      const { status } = sessionTransactions;
      const isTimedOut = getIsTransactionTimedOut(status);
      const isFailed = getIsTransactionFailed(status);
      const isSuccessful = getIsTransactionSuccessful(status);
      const isCompleted = isFailed || isSuccessful || isTimedOut;

      if (isCompleted && this.successfulToastLifetime) {
        this.lifetimeManager.start(toastId);
      }
    }

    await this.renderToasts();
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
    this.lifetimeManager.stop(toastId);
    removeTransactionToast(toastId);
  }

  private async renderToasts() {
    if (this.notificationsFeedManager.isNotificationsFeedOpen()) {
      return;
    }

    const toastsElement = await this.createToastListElement();

    if (!toastsElement) {
      return;
    }

    const eventBus = await toastsElement.getEventBus();

    if (!eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    eventBus.publish(
      ToastEventsEnum.TRANSACTION_TOAST_DATA_UPDATE,
      this.transactionToasts
    );

    eventBus.subscribe(
      ToastEventsEnum.CLOSE_TOAST,
      this.handleTransactionToastClose.bind(this)
    );

    eventBus.subscribe(ToastEventsEnum.OPEN_NOTIFICATIONS_FEED, () => {
      this.transactionToasts = [];
      eventBus.publish(
        ToastEventsEnum.TRANSACTION_TOAST_DATA_UPDATE,
        this.transactionToasts
      );

      this.notificationsFeedManager.openNotificationsFeed();
    });
  }

  private async renderCustomToasts() {
    if (this.notificationsFeedManager.isNotificationsFeedOpen()) {
      return;
    }

    const toastsElement = await this.createToastListElement();
    if (!toastsElement) {
      return;
    }

    const eventBus = await toastsElement.getEventBus();
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
  }

  public destroy() {
    this.storeToastsSubscription();
    this.lifetimeManager?.destroy();
    this.notificationsFeedManager?.destroy();
    removeAllCustomToasts();
  }
}
