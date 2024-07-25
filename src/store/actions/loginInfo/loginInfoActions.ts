import { TokenLoginType } from 'types/login.types';
import {
  LedgerLoginType,
  LoginInfoType,
  WalletConnectLoginType
} from 'store/slices/loginInfo/loginInfo.types';
import { getStore } from 'store/store';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import { NativeAuthConfigType } from 'services/nativeAuth/nativeAuth.types';

export const setProviderType = (providerType: ProviderTypeEnum) =>
  getStore().setState(({ loginInfo: state }) => {
    state.providerType = providerType;
  });

export const setTokenLogin = (tokenLogin: TokenLoginType) =>
  getStore().setState(({ loginInfo: state }) => {
    state.tokenLogin = tokenLogin;
  });

export const setTokenLoginSignature = (signature: string) =>
  getStore().setState(({ loginInfo: state }) => {
    if (state?.tokenLogin != null) {
      state.tokenLogin.signature = signature;
    }
  });

export const setTokenLoginNativeAuthTokenConfig = (
  nativeAuthConfig: NativeAuthConfigType
) =>
  getStore().setState(({ loginInfo: state }) => {
    if (state?.tokenLogin != null) {
      state.tokenLogin.nativeAuthConfig = nativeAuthConfig;
    } else {
      state.tokenLogin = {
        nativeAuthConfig,
        loginToken: ''
      };
    }
  });

export const setWalletLogin = (walletLogin: LoginInfoType | null) =>
  getStore().setState(({ loginInfo: state }) => {
    state.walletLogin = walletLogin;
  });

export const setWalletConnectLogin = (
  walletConnectLogin: WalletConnectLoginType | null
) =>
  getStore().setState(({ loginInfo: state }) => {
    state.walletConnectLogin = walletConnectLogin;
  });

export const setLedgerLogin = (ledgerLogin: LedgerLoginType | null) =>
  getStore().setState(({ loginInfo: state }) => {
    state.ledgerLogin = ledgerLogin;
  });

export const setLogoutRoute = (logoutRoute: string | undefined) =>
  getStore().setState(({ loginInfo: state }) => {
    state.logoutRoute = logoutRoute;
  });

export const setIsWalletConnectV2Initialized = (isInitialized: boolean) =>
  getStore().setState(({ loginInfo: state }) => {
    state.isWalletConnectV2Initialized = isInitialized;
  });
