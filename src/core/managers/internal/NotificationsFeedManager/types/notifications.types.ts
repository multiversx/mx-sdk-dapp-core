import { ITransactionToast } from 'core/managers/internal/ToastManager/types/toast.types';

export interface INotificationsFeedTransaction extends ITransactionToast {
  // Additional properties can be added here if needed
}

export enum NotificationsFeedEventsEnum {
  CLOSE_NOTIFICATIONS_FEED = 'CLOSE_NOTIFICATIONS_FEED',
  CLEAR_NOTIFICATIONS_FEED_HISTORY = 'CLEAR_NOTIFICATIONS_FEED_HISTORY',
  OPEN_NOTIFICATIONS_FEED = 'OPEN_NOTIFICATIONS_FEED',
  PROCESSING_TRANSACTIONS_UPDATE = 'PROCESSING_TRANSACTIONS_UPDATE',
  TRANSACTIONS_HISTORY_UPDATE = 'TRANSACTIONS_HISTORY_UPDATE'
}
