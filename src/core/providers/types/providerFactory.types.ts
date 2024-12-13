import type { IDAppProviderBase } from '@multiversx/sdk-dapp-utils';

// @ts-ignore
export interface IProvider<T extends ProviderTypeEnum = ProviderTypeEnum>
  extends IDAppProviderBase {
  init: () => Promise<boolean>;
  login: (options?: { callbackUrl?: string; token?: string }) => Promise<{
    address: string;
    signature: string;
    multisig?: string;
    impersonate?: string;
    [key: string]: unknown;
  }>;
  logout: () => Promise<boolean>;
  setShouldShowConsentPopup?: (shouldShow: boolean) => void;
  getType: () => T[keyof T] | string;
  getAddress(): Promise<string | undefined>;
  // TODO will be removed as soon as the new login method is implemented in the same way for all providers
  getTokenLoginSignature(): string | undefined;
  // getExtraInfoData(): { multisig?: string; impersonate?: string } | undefined;
}

export interface IEventBus {
  getInstance(): IEventBus;
  subscribe(event: string, callback: Function): void;
  publish(event: string, data?: any): void;
  unsubscribe(event: string, callback: Function): void;
}

export interface IProviderConfigUI {
  ledger: {
    mount: () => Promise<IEventBus>;
  };
  walletConnect: {
    mount: () => Promise<IEventBus>;
  };
}

export interface IProviderConfig {
  account?: {
    address: string;
  };
  UI?: IProviderConfigUI;
}

export enum ProviderTypeEnum {
  iframe = 'iframe',
  crossWindow = 'crossWindow',
  extension = 'extension',
  walletConnect = 'walletConnect',
  ledger = 'ledger',
  opera = 'opera',
  metamask = 'metamask',
  passkey = 'passkey',
  none = ''
}

export interface IProviderFactory<
  T extends ProviderTypeEnum = ProviderTypeEnum
> {
  type: T[keyof T];
}

export interface ICustomProvider<
  T extends ProviderTypeEnum = ProviderTypeEnum
> {
  name: string;
  type: T[keyof T];
  icon: string;
  constructor: (address?: string) => Promise<IProvider>;
}
