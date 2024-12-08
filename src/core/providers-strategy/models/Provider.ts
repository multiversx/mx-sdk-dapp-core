import { Message } from '@multiversx/sdk-core/out/message';
import { Transaction } from '@multiversx/sdk-core/out/transaction';
import { IDAppProviderOptions } from '@multiversx/sdk-dapp-utils/out/models/dappProviderBase';
import type { Nullable } from '@multiversx/sdk-dapp-utils/out/types';
import { IProviderAccount as IExtensionProviderAccount } from '@multiversx/sdk-extension-provider/out';
import { IProviderAccount as IHWProviderAccount } from '@multiversx/sdk-hw-provider/out';
import { IProviderAccount as ICrossWindowProviderAccount } from '@multiversx/sdk-web-wallet-cross-window-provider/out';

export type IProviderAccount =
  | IHWProviderAccount
  | IExtensionProviderAccount
  | ICrossWindowProviderAccount
  | {
      address: string;
      signature: string;
      multisig?: string;
      impersonate?: string;
      [key: string]: unknown;
    };

export interface IProvider {
  init: () => Promise<boolean>;
  login: (options?: { callbackUrl?: string; token?: string }) => Promise<
    | IHWProviderAccount
    | IExtensionProviderAccount
    | ICrossWindowProviderAccount
    | {
        address: string;
        signature: string;
        multisig?: string;
        impersonate?: string;
        [key: string]: unknown;
      }
  >;
  logout: (options?: IDAppProviderOptions) => Promise<boolean>;
  getAccount(): IProviderAccount | null;
  setAccount(account: IProviderAccount): void;
  isInitialized(): boolean;
  isConnected?(): boolean;
  signTransaction(
    transaction: Transaction,
    options?: IDAppProviderOptions
  ): Promise<Nullable<Transaction | undefined>>;
  signTransactions(
    transactions: Transaction[],
    options?: IDAppProviderOptions
  ): Promise<Nullable<Transaction[]>>;
  signMessage(
    messageToSign: Message,
    options?: IDAppProviderOptions
  ): Promise<Nullable<Message>>;
  setShouldShowConsentPopup?: (shouldShow: boolean) => void;
  mountConnectUI?: () => Promise<IEventBus>;
  mountSignUI?: () => Promise<IEventBus>;
  getAddress(): Promise<string | undefined>;
}

export interface IEventBus {
  getInstance(): IEventBus;
  subscribe(event: string, callback: Function): void;
  publish(event: string, data?: any): void;
  unsubscribe(event: string, callback: Function): void;
}
