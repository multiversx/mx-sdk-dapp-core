import { StoreType } from 'store/store.types';

export const loginInfoSelector = ({ loginInfo }: StoreType) => loginInfo;

export const tokenLoginSelector = ({ loginInfo }: StoreType) =>
  loginInfo.tokenLogin;

export const nativeAuthConfigSelector = ({ loginInfo }: StoreType) =>
  loginInfo.tokenLogin?.nativeAuthConfig;
