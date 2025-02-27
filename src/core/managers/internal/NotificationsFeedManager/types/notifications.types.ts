import { ITransactionToast } from 'core/managers/internal/ToastManager/types/toast.types';

export interface INotificationsFeedTransaction extends ITransactionToast {
  // Additional properties can be added here if needed
}

export enum NotificationsFeedEventsEnum {
  'CLOSE' = 'CLOSE',
  'CLEAR' = 'CLEAR',
  'VIEW_ALL' = 'VIEW_ALL',
  'PROCESSING_TRANSACTIONS_UPDATE' = 'PROCESSING_TRANSACTIONS_UPDATE',
  'TRANSACTIONS_HISTORY_UPDATE' = 'TRANSACTIONS_HISTORY_UPDATE'
}
