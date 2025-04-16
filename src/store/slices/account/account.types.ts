import { WebsocketConnectionStatusEnum } from 'constants/websocket.constants';
import { AccountType } from 'types/account.types';
import { BatchTransactionsWSResponseType } from 'types/websocket.types';

export interface LedgerAccountType {
  index: number;
  address: string;
  hasContractDataEnabled: boolean;
  version: string;
}

export type AccountSliceType = {
  address: string;
  accounts: { [address: string]: AccountType };
  publicKey: string;
  ledgerAccount: LedgerAccountType | null;
  walletConnectAccount: string | null;
  websocketStatus: WebsocketConnectionStatusEnum;
  websocketEvent: {
    timestamp: number;
    message: string;
  } | null;
  websocketBatchEvent: {
    timestamp: number;
    data: BatchTransactionsWSResponseType;
  } | null;
};
