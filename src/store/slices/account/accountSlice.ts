import { StateCreator } from 'zustand/vanilla';
import { WebsocketConnectionStatusEnum } from 'core/methods/initApp/websocket/websocket.constants';
import { StoreType, MutatorsIn } from 'store/store.types';
import { AccountSliceType } from './account.types';
import { emptyAccount } from './emptyAccount';

export const initialState: AccountSliceType = {
  address: '',
  websocketEvent: null,
  websocketBatchEvent: null,
  websocketStatus: WebsocketConnectionStatusEnum.NOT_INITIALIZED,
  accounts: { '': emptyAccount },
  ledgerAccount: null,
  publicKey: '',
  walletConnectAccount: null
};

function getAccountSlice(): StateCreator<
  StoreType,
  MutatorsIn,
  [],
  AccountSliceType
> {
  return () => initialState;
}

export const accountSlice = getAccountSlice();
