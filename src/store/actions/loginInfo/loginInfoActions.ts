import { LoginMethodsEnum } from 'types/enums.types';
import { store } from '../../store';
import { TokenLoginType } from 'types/login.types';
import {
  LedgerLoginType,
  LoginInfoType,
  WalletConnectLoginType
} from 'store/slices/loginInfo/loginInfo.types';

export const setLoginMethod = (loginMethod: LoginMethodsEnum) =>
  store.setState(({ loginInfo: state }) => {
    state.loginMethod = loginMethod;
  });

export const setTokenLogin = (tokenLogin: TokenLoginType) =>
  store.setState(({ loginInfo: state }) => {
    state.tokenLogin = tokenLogin;
  });

export const setTokenLoginSignature = (signature: string) =>
  store.setState(({ loginInfo: state }) => {
    if (state?.tokenLogin != null) {
      state.tokenLogin.signature = signature;
    }
  });

export const setWalletLogin = (walletLogin: LoginInfoType | null) =>
  store.setState(({ loginInfo: state }) => {
    state.walletLogin = walletLogin;
  });

export const setWalletConnectLogin = (
  walletConnectLogin: WalletConnectLoginType | null
) =>
  store.setState(({ loginInfo: state }) => {
    state.walletConnectLogin = walletConnectLogin;
  });

export const setLedgerLogin = (ledgerLogin: LedgerLoginType | null) =>
  store.setState(({ loginInfo: state }) => {
    state.ledgerLogin = ledgerLogin;
  });

export const setLogoutRoute = (logoutRoute: string | undefined) =>
  store.setState(({ loginInfo: state }) => {
    state.logoutRoute = logoutRoute;
  });

export const setIsWalletConnectV2Initialized = (isInitialized: boolean) =>
  store.setState(({ loginInfo: state }) => {
    state.isWalletConnectV2Initialized = isInitialized;
  });
