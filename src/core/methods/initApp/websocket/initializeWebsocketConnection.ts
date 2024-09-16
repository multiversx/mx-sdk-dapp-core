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
import {
  setWebsocketBatchEvent,
  setWebsocketEvent
} from 'store/actions/account/accountActions';

const TIMEOUT = 3000;
const RECONNECTION_ATTEMPTS = 3;
const RETRY_INTERVAL = 500;
const MESSAGE_DELAY = 1000;
const BATCH_UPDATED_EVENT = 'batchUpdated';
const CONNECT = 'connect';
const DISCONNECT = 'disconnect';

export async function initializeWebsocketConnection() {
  const { address } = getAccount();
  const { apiAddress } = networkSelector(getStore().getState());

  let messageTimeout: NodeJS.Timeout | null = null;
  let batchTimeout: NodeJS.Timeout | null = null;

  const handleMessageReceived = (message: string) => {
    if (messageTimeout) {
      clearTimeout(messageTimeout);
    }
    messageTimeout = setTimeout(() => {
      setWebsocketEvent(message);
    }, MESSAGE_DELAY);
  };

  const handleBatchUpdate = (data: BatchTransactionsWSResponseType) => {
    if (batchTimeout) {
      clearTimeout(batchTimeout);
    }
    batchTimeout = setTimeout(() => {
      setWebsocketBatchEvent(data);
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

      websocketConnection.instance = io(websocketUrl, {
        forceNew: true,
        reconnectionAttempts: RECONNECTION_ATTEMPTS,
        timeout: TIMEOUT,
        query: { address }
      });

      websocketConnection.status = WebsocketConnectionStatusEnum.COMPLETED;

      websocketConnection.instance.onAny(handleMessageReceived);

      websocketConnection.instance.on(BATCH_UPDATED_EVENT, handleBatchUpdate);

      websocketConnection.instance.on(CONNECT, () => {
        console.log('Websocket connected.');
      });

      websocketConnection.instance.on(DISCONNECT, () => {
        console.warn('Websocket disconnected. Trying to reconnect...');
        setTimeout(() => {
          console.log('Websocket reconnecting...');
          websocketConnection.instance?.connect();
        }, RETRY_INTERVAL);
      });
    },
    { retries: 2, delay: RETRY_INTERVAL }
  );

  const closeConnection = () => {
    websocketConnection.instance?.close();
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
    !websocketConnection.instance?.active
  ) {
    await initializeConnection();
  }

  return {
    closeConnection
  };
}
