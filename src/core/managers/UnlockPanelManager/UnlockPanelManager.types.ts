import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';

export enum UnlockPanelEventsEnum {
  OPEN = 'OPEN',
  CLOSE = 'CLOSE',
  LOGIN = 'LOGIN',
  CANCEL_LOGIN = 'CANCEL_LOGIN'
}

export interface IUnlockPanel {
  isOpen: boolean;
  allowedProviders?: ProviderTypeEnum[] | null;
}
