import isEqual from 'lodash.isequal';
import { NotificationsFeed } from 'lib/sdkDappCoreUi';
import { clearCompletedTransactions } from 'store/actions/transactions/transactionsActions';
import { getStore } from 'store/store';
import { ProviderErrorsEnum } from 'types/provider.types';
import { SignedTransactionType } from 'types/transactions.types';
import { NotificationsFeedEventsEnum } from './types';
import { createUiElement } from '../ToastManager/helpers/createUiElement';
import { processTransactions } from '../ToastManager/helpers/processTransactions';
import { ITransactionToast } from '../ToastManager/types/toast.types';

export class NotificationsFeedManager {
  private static instance: NotificationsFeedManager;
  private isCreatingElement: boolean = false;
  private notificationsFeedElement: NotificationsFeed | undefined;
  private processingTransactions: ITransactionToast[] = [];
  private transactionsHistory: SignedTransactionType[] = [];
  private unsubscribe: () => void = () => null;
  private isOpen: boolean = false;

  store = getStore();

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

    await this.setupEventListeners();
  }

  private async createNotificationsFeedElement(): Promise<
    NotificationsFeed | undefined
  > {
    if (this.notificationsFeedElement) {
      return this.notificationsFeedElement;
    }

    if (!this.isCreatingElement) {
      this.isCreatingElement = true;
      const element =
        await createUiElement<NotificationsFeed>('notifications-feed');
      this.notificationsFeedElement = element || undefined;
      this.isCreatingElement = false;
    }

    return this.notificationsFeedElement;
  }

  private async setupEventListeners() {
    if (!this.notificationsFeedElement) {
      throw new Error('Notifications feed element not created');
    }

    const eventBus = await this.notificationsFeedElement.getEventBus();
    if (!eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    eventBus.subscribe(
      NotificationsFeedEventsEnum.CLOSE_NOTIFICATIONS_FEED,
      () => {
        this.isOpen = false;
        if (this.notificationsFeedElement) {
          this.notificationsFeedElement.style.display = 'none';
        }
      }
    );

    eventBus.subscribe(
      NotificationsFeedEventsEnum.CLEAR_NOTIFICATIONS_FEED_HISTORY,
      () => {
        clearCompletedTransactions();
        this.transactionsHistory = [];
        this.updateNotificationsFeed();
      }
    );
  }

  private async updateTransactions(toastList: any) {
    const { transactions: sessions, account } = this.store.getState();

    const { processingTransactions } = processTransactions(
      toastList,
      sessions,
      account
    );

    this.processingTransactions = processingTransactions;

    // Sort session keys (timestamps) in descending order
    const sortedSessionKeys = Object.keys(sessions).sort(
      (a, b) => Number(b) - Number(a)
    );

    // Merge all transactions from all sessions
    this.transactionsHistory = sortedSessionKeys.reduce<
      SignedTransactionType[]
    >((allTransactions, sessionKey) => {
      const sessionTransactions = sessions[sessionKey]?.transactions || [];
      return [...allTransactions, ...sessionTransactions];
    }, []);

    await this.updateNotificationsFeed();
  }

  private async updateNotificationsFeed() {
    if (!this.notificationsFeedElement) {
      return;
    }

    const eventBus = await this.notificationsFeedElement.getEventBus();

    if (!eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    eventBus.publish(
      NotificationsFeedEventsEnum.PROCESSING_TRANSACTIONS_UPDATE,
      this.processingTransactions
    );

    eventBus.publish(
      NotificationsFeedEventsEnum.TRANSACTIONS_HISTORY_UPDATE,
      this.transactionsHistory
    );
  }

  public async openNotificationsFeed() {
    if (this.isOpen && this.notificationsFeedElement) {
      return;
    }

    if (!this.notificationsFeedElement) {
      await this.createNotificationsFeedElement();
    }

    if (!this.notificationsFeedElement) {
      throw new Error('Failed to create notifications feed element');
    }

    const eventBus = await this.notificationsFeedElement.getEventBus();

    if (!eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    const { toasts } = this.store.getState();
    await this.updateTransactions(toasts);

    this.isOpen = true;
    this.notificationsFeedElement.style.display = 'block';
    eventBus.publish(NotificationsFeedEventsEnum.OPEN_NOTIFICATIONS_FEED);
  }

  public destroy() {
    this.unsubscribe();

    if (this.notificationsFeedElement) {
      const parentElement = this.notificationsFeedElement.parentElement;

      if (parentElement) {
        parentElement.removeChild(this.notificationsFeedElement);
      }

      this.notificationsFeedElement = undefined;
    }
    this.isOpen = false;
  }
}
