import isEqual from 'lodash.isequal';
import { NotificationsFeed } from 'lib/sdkDappCoreUi';
import { clearCompletedTransactions } from 'store/actions/transactions/transactionsActions';
import { getStore } from 'store/store';
import { ProviderErrorsEnum } from 'types/provider.types';
import { NotificationsFeedEventsEnum } from './types';
import { createUiElement } from '../ToastManager/helpers/createUiElement';
import { processTransactions } from '../ToastManager/helpers/processTransactions';
import { ITransactionToast } from '../ToastManager/types/toast.types';

export class NotificationsFeedManager {
  private isCreatingElement: boolean = false;
  private notificationsFeedElement: NotificationsFeed | undefined;
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

    // Use the shared helper to process transactions
    const { processingTransactions, completedTransactions } =
      processTransactions(
        toastList,
        sessions,
        account,
        this.transactionsHistory
      );

    // Update local state
    this.processingTransactions = processingTransactions;
    this.transactionsHistory = completedTransactions;

    // Only update the UI if the panel is visible
    if (this.isVisible) {
      await this.updateNotificationsFeed();
    }
  }

  private async createNotificationsFeedElement(): Promise<
    NotificationsFeed | undefined
  > {
    if (this.notificationsFeedElement) {
      return this.notificationsFeedElement;
    }

    if (!this.isCreatingElement) {
      this.isCreatingElement = true;
      // Use the shared helper to create the UI element
      const element = await createUiElement<NotificationsFeed>(
        'notifications-feed',
        this.isVisible
      );

      this.notificationsFeedElement = element || undefined;
      this.isCreatingElement = false;
      return this.notificationsFeedElement;
    }

    return undefined;
  }

  private async updateNotificationsFeed() {
    const notificationsFeedElement =
      await this.createNotificationsFeedElement();

    console.log('updateNotificationsFeed');

    if (!notificationsFeedElement) {
      return;
    }

    const eventBus = await notificationsFeedElement.getEventBus();

    if (!eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    console.log('processingTransactions', this.processingTransactions);

    eventBus.publish(NotificationsFeedEventsEnum.OPEN_NOTIFICATIONS_FEED);

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

    // Listen for OPEN_NOTIFICATIONS_FEED event
    eventBus.subscribe(
      NotificationsFeedEventsEnum.OPEN_NOTIFICATIONS_FEED,
      () => {
        this.openNotificationsFeed();
      }
    );

    // Listen for CLOSE_NOTIFICATIONS_FEED event
    eventBus.subscribe(
      NotificationsFeedEventsEnum.CLOSE_NOTIFICATIONS_FEED,
      () => {
        // Close the notifications-feed component
        if (this.notificationsFeedElement) {
          this.notificationsFeedElement.style.display = 'none';
          this.isVisible = false;
        }
      }
    );

    // Listen for CLEAR_NOTIFICATIONS_FEED_HISTORY event
    eventBus.subscribe(
      NotificationsFeedEventsEnum.CLEAR_NOTIFICATIONS_FEED_HISTORY,
      () => {
        // Clear all completed transactions from the store
        clearCompletedTransactions();

        // Clear the local history
        this.transactionsHistory = [];

        // Update the notifications-feed component
        eventBus.publish(
          NotificationsFeedEventsEnum.TRANSACTIONS_HISTORY_UPDATE,
          this.transactionsHistory
        );
      }
    );
  }

  /**
   * Trigger the "View All" action to show the full notifications feed
   * This method can be called programmatically or bound to UI elements
   */
  public async viewAll() {
    // Directly call openNotificationsFeed instead of publishing an event
    // to avoid circular event handling
    this.openNotificationsFeed();
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
