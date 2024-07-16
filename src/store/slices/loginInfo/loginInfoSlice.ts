import { LoginMethodsEnum } from 'types/enums.types';
import { StateCreator } from 'zustand/vanilla';
import { StoreType, MutatorsIn } from 'store/store.types';
import { LoginInfoSliceType } from './loginInfo.types';

export const initialState: LoginInfoSliceType = {
  loginMethod: LoginMethodsEnum.none,
  walletConnectLogin: null,
  ledgerLogin: null,
  tokenLogin: null,
  walletLogin: null,
  extensionLogin: null,
  operaLogin: null,
  crossWindowLogin: null
};

function getTokenInfoSlice(): StateCreator<
  StoreType,
  MutatorsIn,
  [],
  LoginInfoSliceType
> {
  return () => initialState;
}

export const loginInfoSlice = getTokenInfoSlice();
