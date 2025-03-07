import isEqual from 'lodash.isequal';
import { UITagsEnum } from 'constants/UITags.enum';
import { TransactionsHistoryController } from 'controllers/TransactionsHistoryController';
import {
  NotificationsFeed,
  IEventBus,
  ITransactionListItem
} from 'lib/sdkDappCoreUi';
import { clearCompletedTransactions } from 'store/actions/transactions/transactionsActions';
import { getStore } from 'store/store';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement } from 'utils/createUIElement';
import { NotificationsFeedEventsEnum } from './types';
import { createToastsFromTransactions } from '../ToastManager/helpers/createToastsFromTransactions';
import { ITransactionToast } from '../ToastManager/types/toast.types';

export class NotificationsFeedManager {
  private static instance: NotificationsFeedManager;
  private eventBus: IEventBus | null = null;
  private historicTransactions: ITransactionListItem[] = [];
  private isCreatingElement = false;
  private isOpen = false;
  private notificationsFeedElement: NotificationsFeed | null = null;
  private pendingTransactions: ITransactionToast[] = [];
  private store = getStore();
  private storeToastsUnsubscribe: () => void = () => null;

  public static getInstance(): NotificationsFeedManager {
    if (!NotificationsFeedManager.instance) {
      NotificationsFeedManager.instance = new NotificationsFeedManager();
    }
    return NotificationsFeedManager.instance;
  }

  public isNotificationsFeedOpen(): boolean {
    return this.isOpen;
  }

  public async init() {
    await this.createNotificationsFeedElement();
    await this.updateData();

    this.storeToastsUnsubscribe = this.store.subscribe(
      async (
        { toasts, transactions },
        { toasts: prevToasts, transactions: prevTransactions }
      ) => {
        if (
          !isEqual(prevToasts.transactionToasts, toasts.transactionToasts) ||
          !isEqual(prevTransactions, transactions)
        ) {
          await this.updateData();
        }
      }
    );

    await this.setupEventListeners();
  }

  public async openNotificationsFeed() {
    if (this.isOpen && this.notificationsFeedElement) {
      return;
    }

    if (!this.notificationsFeedElement) {
      await this.createNotificationsFeedElement();
    }

    if (!this.notificationsFeedElement || !this.eventBus) {
      return;
    }

    await this.updateData();
    this.isOpen = true;
    this.eventBus.publish(NotificationsFeedEventsEnum.OPEN_NOTIFICATIONS_FEED);
  }

  public destroy() {
    this.storeToastsUnsubscribe();

    if (this.eventBus) {
      this.eventBus.unsubscribe(
        NotificationsFeedEventsEnum.CLOSE_NOTIFICATIONS_FEED,
        this.handleCloseNotificationsFeed.bind(this)
      );

      this.eventBus.unsubscribe(
        NotificationsFeedEventsEnum.CLEAR_NOTIFICATIONS_FEED_HISTORY,
        this.handleClearNotificationsFeedHistory.bind(this)
      );

      this.eventBus = null;
    }

    if (this.notificationsFeedElement) {
      const parentElement = this.notificationsFeedElement.parentElement;

      if (parentElement) {
        parentElement.removeChild(this.notificationsFeedElement);
      }

      this.notificationsFeedElement = null;
    }

    this.isOpen = false;
  }

  private async getEventBus(): Promise<IEventBus | null> {
    if (!this.notificationsFeedElement) {
      await this.createNotificationsFeedElement();
    }

    if (!this.notificationsFeedElement) {
      return null;
    }

    if (!this.eventBus) {
      this.eventBus = await this.notificationsFeedElement.getEventBus();
    }

    if (!this.eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    return this.eventBus;
  }

  private async createNotificationsFeedElement(): Promise<NotificationsFeed | null> {
    if (this.notificationsFeedElement) {
      return this.notificationsFeedElement;
    }

    if (!this.isCreatingElement) {
      this.isCreatingElement = true;
      const element = await createUIElement<NotificationsFeed>({
        name: UITagsEnum.NOTIFICATIONS_FEED
      });

      this.notificationsFeedElement = element || null;
      await this.getEventBus();
      this.isCreatingElement = false;
    }

    if (!this.notificationsFeedElement) {
      throw new Error('Failed to create notifications feed element');
    }

    return this.notificationsFeedElement;
  }

  private async setupEventListeners() {
    if (!this.notificationsFeedElement) {
      await this.createNotificationsFeedElement();
    }

    if (!this.eventBus) {
      return;
    }

    this.eventBus.subscribe(
      NotificationsFeedEventsEnum.CLOSE_NOTIFICATIONS_FEED,
      this.handleCloseNotificationsFeed.bind(this)
    );

    this.eventBus.subscribe(
      NotificationsFeedEventsEnum.CLEAR_NOTIFICATIONS_FEED_HISTORY,
      this.handleClearNotificationsFeedHistory.bind(this)
    );
  }

  private handleCloseNotificationsFeed() {
    this.isOpen = false;
  }

  private handleClearNotificationsFeedHistory() {
    clearCompletedTransactions();
    this.historicTransactions = [];
    this.updateNotificationsFeed();
  }

  private async updateData() {
    const {
      transactions: sessions,
      account,
      toasts,
      network
    } = this.store.getState();

    const { pendingTransactions } = createToastsFromTransactions({
      toastList: toasts,
      sessions,
      account
    });

    this.pendingTransactions = pendingTransactions;

    this.historicTransactions =
      await TransactionsHistoryController.getTransactionsHistory({
        sessions,
        address: account.address,
        explorerAddress: network.network.explorerAddress,
        egldLabel: network.network.egldLabel
      });

    await this.updateNotificationsFeed();
  }

  private async updateNotificationsFeed() {
    if (!this.notificationsFeedElement) {
      await this.createNotificationsFeedElement();
    }

    if (!this.eventBus) {
      return;
    }

    this.eventBus.publish(
      NotificationsFeedEventsEnum.PENDING_TRANSACTIONS_UPDATE,
      this.pendingTransactions
    );

    this.eventBus.publish(
      NotificationsFeedEventsEnum.TRANSACTIONS_HISTORY_UPDATE,
      this.historicTransactions
    );
  }
}
