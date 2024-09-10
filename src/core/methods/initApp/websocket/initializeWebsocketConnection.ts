import { io } from 'socket.io-client';
import { retryMultipleTimes } from 'utils/retryMultipleTimes';
import {
  BatchTransactionsWSResponseType,
  websocketConnection,
  WebsocketConnectionStatusEnum
} from './websocket.constants';
import { getWebsocketUrl } from 'apiCalls/websocket';
import { getStore } from 'store/store';
import { getAccount } from 'core/methods/account/getAccount';
import { networkSelector } from 'store/selectors';

const TIMEOUT = 3000;
const RECONNECTION_ATTEMPTS = 3;
const RETRY_INTERVAL = 500;
const MESSAGE_DELAY = 1000;
const BATCH_UPDATED_EVENT = 'batchUpdated';
const CONNECT = 'connect';
const DISCONNECT = 'disconnect';

export interface IWebsocketHandlerOptions {
  onMessageReceived: (message: string) => void;
  onBatchUpdate?: (data: BatchTransactionsWSResponseType) => void;
}

export async function initializeWebsocketConnection({
  onMessageReceived,
  onBatchUpdate
}: IWebsocketHandlerOptions) {
  const { address } = getAccount();
  const { apiAddress } = networkSelector(getStore().getState());

  let messageTimeout: NodeJS.Timeout | null = null;
  let batchTimeout: NodeJS.Timeout | null = null;

  const handleMessageReceived = (message: string) => {
    if (messageTimeout) {
      clearTimeout(messageTimeout);
    }
    messageTimeout = setTimeout(() => {
      onMessageReceived(message);
    }, MESSAGE_DELAY);
  };

  const handleBatchUpdate = (data: BatchTransactionsWSResponseType) => {
    if (batchTimeout) {
      clearTimeout(batchTimeout);
    }
    batchTimeout = setTimeout(() => {
      onBatchUpdate?.(data);
    }, MESSAGE_DELAY);
  };

  const initializeConnection = retryMultipleTimes(
    async () => {
      // To avoid multiple connections to the same endpoint
      websocketConnection.status = WebsocketConnectionStatusEnum.PENDING;

      const websocketUrl = await getWebsocketUrl(apiAddress);

      if (!websocketUrl) {
        console.warn('Cannot get websocket URL');
        return;
      }

      websocketConnection.current = io(websocketUrl, {
        forceNew: true,
        reconnectionAttempts: RECONNECTION_ATTEMPTS,
        timeout: TIMEOUT,
        query: { address }
      });

      websocketConnection.status = WebsocketConnectionStatusEnum.COMPLETED;

      websocketConnection.current.onAny(handleMessageReceived);

      websocketConnection.current.on(BATCH_UPDATED_EVENT, handleBatchUpdate);

      websocketConnection.current.on(CONNECT, () => {
        console.log('Websocket connected.');
      });

      websocketConnection.current.on(DISCONNECT, () => {
        console.warn('Websocket disconnected. Trying to reconnect...');
        setTimeout(() => {
          console.log('Websocket reconnecting...');
          websocketConnection.current?.connect();
        }, RETRY_INTERVAL);
      });
    },
    { retries: 2, delay: RETRY_INTERVAL }
  );

  const closeConnection = () => {
    websocketConnection.current?.close();
    websocketConnection.status = WebsocketConnectionStatusEnum.NOT_INITIALIZED;
    if (messageTimeout) {
      clearTimeout(messageTimeout);
    }
    if (batchTimeout) {
      clearTimeout(batchTimeout);
    }
  };

  if (
    address &&
    websocketConnection.status ===
      WebsocketConnectionStatusEnum.NOT_INITIALIZED &&
    !websocketConnection.current?.active
  ) {
    await initializeConnection();
  }

  return {
    closeConnection
  };
}
