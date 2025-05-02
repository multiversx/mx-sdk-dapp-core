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
  cancelLogin?: () => void;
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
  crossWindow = 'crossWindow',
  extension = 'extension',
  walletConnect = 'walletConnect',
  ledger = 'ledger',
  metamask = 'metamask',
  passkey = 'passkey',
  webview = 'webview',
  none = ''
}

export const providerLabels: Record<string, string> = {
  [ProviderTypeEnum.crossWindow]: 'MultiversX Web Wallet',
  [ProviderTypeEnum.extension]: 'MultiversX Wallet Extension',
  [ProviderTypeEnum.walletConnect]: 'xPortal App',
  [ProviderTypeEnum.ledger]: 'Ledger',
  [ProviderTypeEnum.metamask]: 'MetaMask Snap',
  [ProviderTypeEnum.passkey]: 'Passkey',
  [ProviderTypeEnum.none]: ''
};

export interface IProviderFactory<
  T extends ProviderTypeEnum = ProviderTypeEnum
> {
  type: T[keyof T];
  anchor?: HTMLElement;
}

export interface ICustomProviderBase<
  T extends ProviderTypeEnum = ProviderTypeEnum
> {
  name: string;
  type: T[keyof T];
  iconUrl?: string;
}
export interface ICustomProvider<T extends ProviderTypeEnum = ProviderTypeEnum>
  extends ICustomProviderBase<T> {
  constructor: (address?: string) => Promise<IProvider>;
}
