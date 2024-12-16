import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';

// types here need to be synced with the types in sdk-dapp-core-ui
export enum PendingTransactionsEventsEnum {
  'CLOSE' = 'CLOSE',
  'DATA_UPDATE' = 'DATA_UPDATE'
}

export interface IPendingTransactionsModalData {
  isPending: boolean;
  type: ProviderTypeEnum;
  title: string;
  subtitle?: string;
  shouldClose?: boolean;
}
