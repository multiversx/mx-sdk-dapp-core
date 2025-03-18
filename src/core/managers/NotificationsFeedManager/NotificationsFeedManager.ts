import isEqual from 'lodash.isequal';
import { UITagsEnum } from 'constants/UITags.enum';
import { TransactionsHistoryController } from 'controllers/TransactionsHistoryController';
import { NotificationsFeed, ITransactionListItem } from 'lib/sdkDappCoreUi';
import { clearCompletedTransactions } from 'store/actions/transactions/transactionsActions';
import { getStore } from 'store/store';
import { NotificationsFeedEventsEnum } from './types';
import { BaseUIManager } from '../base/BaseUIManager';
import { createToastsFromTransactions } from '../internal/ToastManager/helpers/createToastsFromTransactions';
import { ITransactionToast } from '../internal/ToastManager/types/toast.types';

export class NotificationsFeedManager extends BaseUIManager<
  NotificationsFeed,
  {
    shouldClose?: boolean;
  },
  NotificationsFeedEventsEnum
> {
  private static instance: NotificationsFeedManager;
  private historicTransactions: ITransactionListItem[] = [];
  private pendingTransactions: ITransactionToast[] = [];
  private store = getStore();
  private storeToastsUnsubscribe: () => void = () => null;

  protected initialData = {
    shouldClose: false
  };

  public static getInstance(): NotificationsFeedManager {
    if (!NotificationsFeedManager.instance) {
      NotificationsFeedManager.instance = new NotificationsFeedManager();
    }
    return NotificationsFeedManager.instance;
  }

  private constructor() {
    super();
  }

  public isNotificationsFeedOpen(): boolean {
    return this.isOpen;
  }

  public async init() {
    await super.init();
    await this.updateDataAndNotifications();

    this.storeToastsUnsubscribe = this.store.subscribe(
      async (
        { toasts, transactions },
        { toasts: prevToasts, transactions: prevTransactions }
      ) => {
        if (
          !isEqual(prevToasts.transactionToasts, toasts.transactionToasts) ||
          !isEqual(prevTransactions, transactions)
        ) {
          await this.updateDataAndNotifications();
        }
      }
    );
  }

  public async openNotificationsFeed() {
    await this.openUI();
    await this.updateDataAndNotifications();
  }

  public destroy() {
    this.storeToastsUnsubscribe();
    super.destroy();
  }

  protected getUIElementName(): UITagsEnum {
    return UITagsEnum.NOTIFICATIONS_FEED;
  }

  protected getOpenEventName(): NotificationsFeedEventsEnum {
    return NotificationsFeedEventsEnum.OPEN_NOTIFICATIONS_FEED;
  }

  protected getCloseEventName(): NotificationsFeedEventsEnum {
    return NotificationsFeedEventsEnum.CLOSE_NOTIFICATIONS_FEED;
  }

  protected getDataUpdateEventName(): NotificationsFeedEventsEnum {
    return NotificationsFeedEventsEnum.TRANSACTIONS_HISTORY_UPDATE;
  }

  protected handleCloseUI() {
    this.isOpen = false;
  }

  protected async setupEventListeners() {
    if (!this.eventBus) {
      return;
    }

    this.eventBus.subscribe(
      NotificationsFeedEventsEnum.CLOSE_NOTIFICATIONS_FEED,
      this.handleCloseUI.bind(this)
    );

    this.eventBus.subscribe(
      NotificationsFeedEventsEnum.CLEAR_NOTIFICATIONS_FEED_HISTORY,
      this.handleClearNotificationsFeedHistory.bind(this)
    );
  }

  private handleClearNotificationsFeedHistory() {
    clearCompletedTransactions();
    this.historicTransactions = [];
    this.updateNotificationsFeed();
  }

  protected async updateDataAndNotifications() {
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
    if (!this.eventBus) {
      await this.getEventBus();
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
