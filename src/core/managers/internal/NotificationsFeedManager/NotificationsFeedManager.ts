import isEqual from 'lodash.isequal';
import { getExplorerAddress } from 'core/methods/network/getExplorerAddress';
import { ToastList } from 'lib/sdkDappCoreUi';
import { clearCompletedTransactions } from 'store/actions/transactions/transactionsActions';
import {
  getIsTransactionFailed,
  getIsTransactionPending,
  getIsTransactionSuccessful,
  getIsTransactionTimedOut
} from 'store/actions/transactions/transactionStateByStatus';
import { getStore } from 'store/store';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement } from 'utils/createUIElement';
import { explorerUrlBuilder } from 'utils/transactions/explorerUrlBuilder';
import { getExplorerLink } from 'utils/transactions/getExplorerLink';
import { NotificationsFeedEventsEnum } from './types';
import { getToastDataStateByStatus } from '../ToastManager/helpers/getToastDataStateByStatus';
import { getToastProceededStatus } from '../ToastManager/helpers/getToastProceededStatus';
import { ITransactionToast } from '../ToastManager/types/toast.types';

export class NotificationsFeedManager {
  private isCreatingElement: boolean = false;
  private notificationsFeedElement: ToastList | undefined;
  private processingTransactions: ITransactionToast[] = [];
  private transactionsHistory: ITransactionToast[] = [];
  private unsubscribe: () => void = () => null;
  private isVisible: boolean = false;

  store = getStore();

  constructor() {
    this.destroy();
  }

  public init() {
    const { toasts } = this.store.getState();
    this.updateTransactions(toasts);

    this.unsubscribe = this.store.subscribe(
      (
        { toasts, transactions },
        { toasts: prevToasts, transactions: prevTransactions }
      ) => {
        if (
          !isEqual(prevToasts.transactionToasts, toasts.transactionToasts) ||
          !isEqual(prevTransactions, transactions)
        ) {
          this.updateTransactions(toasts);
        }
      }
    );
  }

  /**
   * Opens the notifications feed panel showing both processing transactions and transaction history
   * This method would be called when the "View All" button is clicked
   */
  public openNotificationsFeed() {
    this.isVisible = true;
    if (this.notificationsFeedElement) {
      this.notificationsFeedElement.style.display = 'block';
    } else {
      // If element doesn't exist yet, create it and then update
      this.updateNotificationsFeed();
    }
  }

  private async updateTransactions(toastList: any) {
    const { transactions: sessions, account } = this.store.getState();
    // Reset processing transactions before updating
    this.processingTransactions = [];
    const explorerAddress = getExplorerAddress();

    for (const toast of toastList.transactionToasts) {
      const sessionTransactions = sessions[toast.toastId];
      if (!sessionTransactions) {
        continue;
      }

      const { startTime, toastId, endTime } = toast;
      const { status, transactions, transactionsDisplayInfo } =
        sessionTransactions;
      const isPending = getIsTransactionPending(status);
      const isTimedOut = getIsTransactionTimedOut(status);
      const isFailed = getIsTransactionFailed(status);
      const isSuccessful = getIsTransactionSuccessful(status);
      const isCompleted = isFailed || isSuccessful || isTimedOut;

      if (isCompleted) {
        // Add completed transactions to history if not already present
        if (!this.transactionsHistory.some((t) => t.toastId === toastId)) {
          const completedTransaction = this.createTransactionToast({
            toast,
            account,
            status,
            transactions,
            transactionsDisplayInfo,
            explorerAddress,
            startTime,
            endTime
          });
          this.transactionsHistory.push(completedTransaction);
        }
      } else if (isPending) {
        // Add processing transactions
        const transactionToast = this.createTransactionToast({
          toast,
          account,
          status,
          transactions,
          transactionsDisplayInfo,
          explorerAddress,
          startTime,
          endTime
        });
        this.processingTransactions.push(transactionToast);
      }
    }

    // Only update the UI if the panel is visible or we're forcing it
    if (this.isVisible) {
      await this.updateNotificationsFeed();
    }
  }

  private createTransactionToast({
    toast,
    account,
    status,
    transactions,
    transactionsDisplayInfo,
    explorerAddress,
    startTime,
    endTime
  }: any): ITransactionToast {
    const { toastId } = toast;
    const isPending = getIsTransactionPending(status);

    return {
      toastDataState: getToastDataStateByStatus({
        address: account.address,
        sender: transactions[0]?.sender,
        toastId,
        status,
        transactionsDisplayInfo
      }),
      processedTransactionsStatus: getToastProceededStatus(transactions),
      transactionProgressState: isPending
        ? {
            endTime,
            startTime
          }
        : null,
      toastId,
      transactions: transactions.map(({ hash, status }: any) => ({
        hash,
        status: status ?? TransactionServerStatusesEnum.pending,
        link: getExplorerLink({
          explorerAddress,
          to: explorerUrlBuilder.transactionDetails(hash)
        })
      }))
    };
  }

  private async createNotificationsFeedElement(): Promise<ToastList | null> {
    if (this.notificationsFeedElement) {
      return this.notificationsFeedElement;
    }

    if (!this.isCreatingElement) {
      this.isCreatingElement = true;
      this.notificationsFeedElement = await createUIElement<ToastList>({
        name: 'notifications-feed'
      });

      // Initially hide the element if not meant to be visible
      if (!this.isVisible && this.notificationsFeedElement) {
        this.notificationsFeedElement.style.display = 'none';
      }

      this.isCreatingElement = false;
      return this.notificationsFeedElement;
    }

    return null;
  }

  private async updateNotificationsFeed() {
    const notificationsFeedElement =
      await this.createNotificationsFeedElement();
    if (!notificationsFeedElement) {
      return;
    }

    const eventBus = await notificationsFeedElement.getEventBus();
    if (!eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    // Send processing transactions update to the notifications-feed component
    eventBus.publish(
      NotificationsFeedEventsEnum.PROCESSING_TRANSACTIONS_UPDATE,
      this.processingTransactions
    );

    // Send transactions history update to the notifications-feed component
    eventBus.publish(
      NotificationsFeedEventsEnum.TRANSACTIONS_HISTORY_UPDATE,
      this.transactionsHistory
    );

    // Listen for VIEW_ALL event
    eventBus.subscribe(NotificationsFeedEventsEnum.VIEW_ALL, () => {
      this.openNotificationsFeed();
    });

    // Listen for CLOSE event
    eventBus.subscribe(NotificationsFeedEventsEnum.CLOSE, () => {
      // Close the notifications-feed component
      if (this.notificationsFeedElement) {
        this.notificationsFeedElement.style.display = 'none';
        this.isVisible = false;
      }
    });

    // Listen for CLEAR event
    eventBus.subscribe(NotificationsFeedEventsEnum.CLEAR, () => {
      // Clear all completed transactions from the store
      clearCompletedTransactions();

      // Clear the local history
      this.transactionsHistory = [];

      // Update the notifications-feed component
      eventBus.publish(
        NotificationsFeedEventsEnum.TRANSACTIONS_HISTORY_UPDATE,
        this.transactionsHistory
      );
    });
  }

  /**
   * Trigger the "View All" action to show the full notifications feed
   * This method can be called programmatically or bound to UI elements
   */
  public viewAll() {
    const publishViewAllEvent = async () => {
      const element = await this.createNotificationsFeedElement();
      if (element) {
        const eventBus = await element.getEventBus();
        if (eventBus) {
          eventBus.publish(NotificationsFeedEventsEnum.VIEW_ALL);
        }
      }
    };

    publishViewAllEvent();
  }

  public destroy() {
    this.unsubscribe();

    // Clean up
    if (this.notificationsFeedElement) {
      const parentElement = this.notificationsFeedElement.parentElement;
      if (parentElement) {
        parentElement.removeChild(this.notificationsFeedElement);
      }
      this.notificationsFeedElement = undefined;
    }
  }
}
