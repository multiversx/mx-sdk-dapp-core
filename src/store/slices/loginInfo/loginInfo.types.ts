import { TokenLoginType } from 'types/login.types';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';

export interface WalletConnectLoginType {
  loginType: string;
  callbackRoute: string;
  logoutRoute: string;
}

export interface LedgerLoginType {
  index: number;
  loginType: string;
}

export interface LoginInfoType {
  data: any;
  expires: number;
}

export interface LoginInfoSliceType {
  providerType: ProviderTypeEnum | null;
  walletConnectLogin: WalletConnectLoginType | null;
  ledgerLogin: LedgerLoginType | null;
  tokenLogin: TokenLoginType | null;
  walletLogin: LoginInfoType | null;
  extensionLogin: LoginInfoType | null;
  operaLogin: LoginInfoType | null;
  crossWindowLogin: LoginInfoType | null;
  logoutRoute?: string;
  isWalletConnectV2Initialized?: boolean;
}
