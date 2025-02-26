// types here need to be synced with the types in sdk-dapp-core-ui
export enum PendingTransactionsEventsEnum {
  'CLOSE' = 'CLOSE',
  'DATA_UPDATE' = 'DATA_UPDATE'
}

export interface IPendingTransactionsModalData {
  isPending: boolean;
  title: string;
  subtitle?: string;
  shouldClose?: boolean;
}
