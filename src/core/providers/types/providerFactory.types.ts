import type { IDAppProviderBase } from '@multiversx/sdk-dapp-utils';

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
}

export interface IProviderConfig {
  account?: {
    address: string;
  };
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
  webview = 'webview',
  none = ''
}

export interface IProviderFactory<
  T extends ProviderTypeEnum = ProviderTypeEnum
> {
  type: T[keyof T];
  anchor?: HTMLElement;
}

export interface ICustomProvider<
  T extends ProviderTypeEnum = ProviderTypeEnum
> {
  name: string;
  type: T[keyof T];
  icon: string;
  constructor: (address?: string) => Promise<IProvider>;
}
