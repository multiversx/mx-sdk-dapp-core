import { Socket } from 'socket.io-client';

export type BatchTransactionsWSResponseType = {
  batchId: string;
  txHashes: string[];
};

export enum WebsocketConnectionStatusEnum {
  NOT_INITIALIZED = 'not_initialized',
  PENDING = 'pending',
  COMPLETED = 'completed'
}

export const websocketConnection: {
  instance: Socket | null;
  // Use the connection status to avoid multiple websocket connections
  status: WebsocketConnectionStatusEnum;
} = {
  instance: null,
  status: WebsocketConnectionStatusEnum.NOT_INITIALIZED
};
