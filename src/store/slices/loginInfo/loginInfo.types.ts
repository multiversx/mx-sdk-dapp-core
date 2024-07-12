import { LoginMethodsEnum } from 'types/enums.types';
import { TokenLoginType } from 'types/login.types';

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
  loginMethod: LoginMethodsEnum;
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
