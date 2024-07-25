import type { IDAppProviderBase } from '@multiversx/sdk-dapp-utils';

export interface IProvider extends IDAppProviderBase {
  init: () => Promise<boolean>;
  // TODO change return type to { address: string, signature: string } and also change the return type in IDAppProviderBase.
  login: (options?: { token?: string }) => Promise<string | boolean>;
  logout: () => Promise<boolean>;
  setAddress: (address: string) => IProvider;
  setShouldShowConsentPopup?: (shouldShow: boolean) => void;
  getAddress(): string | undefined;
  // TODO will be removed as soon as the new login method is implemented in the same way for all providers
  getTokenLoginSignature(): string | undefined;
}

export interface IProviderConfig {
  network: {
    walletAddress: string;
  };
}

export enum ProviderTypeEnum {
  iframe = 'iframe',
  crossWindow = 'crossWindow',
  extension = 'extension',
  walletConnect = 'walletConnect',
  hardware = 'hardware',
  opera = 'opera',
  metamask = 'metamask',
  webhook = 'webhook',
  custom = 'custom',
  none = ''
}

export interface IProviderFactory {
  type: ProviderTypeEnum;
  config: IProviderConfig;
  customProvider?: IProvider;
}