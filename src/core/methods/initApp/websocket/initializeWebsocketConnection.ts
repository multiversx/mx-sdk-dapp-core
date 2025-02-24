import { io } from 'socket.io-client';
import { getWebsocketUrl } from 'apiCalls/websocket';
import { getAccount } from 'core/methods/account/getAccount';
import {
  setWebsocketBatchEvent,
  setWebsocketEvent
} from 'store/actions/account/accountActions';
import { networkSelector } from 'store/selectors';
import { getStore } from 'store/store';
import { retryMultipleTimes } from 'utils/retryMultipleTimes';
import {
  BatchTransactionsWSResponseType,
  websocketConnection,
  WebsocketConnectionStatusEnum
} from './websocket.constants';

const TIMEOUT = 3000;
const RECONNECTION_ATTEMPTS = 3;
const RETRY_INTERVAL = 500;
const MESSAGE_DELAY = 1000;
const BATCH_UPDATED_EVENT = 'batchUpdated';
const CONNECT = 'connect';
const CONNECT_ERROR = 'connect_error';
const DISCONNECT = 'disconnect';

// eslint-disable-next-line no-undef
type TimeoutType = NodeJS.Timeout | null;

export async function initializeWebsocketConnection() {
  const { address } = getAccount();
  const { apiAddress, websocketUrl: customWebsocketUrl } = networkSelector(
    getStore().getState()
  );

  let messageTimeout: TimeoutType = null;
  let batchTimeout: TimeoutType = null;

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

  const retryWebsocketConnect = () => {
    setTimeout(() => {
      if (address) {
        console.log('Websocket reconnecting...');
        websocketConnection.status = WebsocketConnectionStatusEnum.PENDING;
        websocketConnection.instance?.connect();
      }
    }, RETRY_INTERVAL);
  };

  const closeConnection = () => {
    if (websocketConnection.instance) {
      websocketConnection.instance.off(CONNECT_ERROR);
      websocketConnection.instance.off(CONNECT);
      websocketConnection.instance.off(BATCH_UPDATED_EVENT);
      websocketConnection.instance.close();
    }

    websocketConnection.status = WebsocketConnectionStatusEnum.NOT_INITIALIZED;
    websocketConnection.instance = null;

    if (messageTimeout) {
      clearTimeout(messageTimeout);
    }

    if (batchTimeout) {
      clearTimeout(batchTimeout);
    }
  };

  const initializeConnection = retryMultipleTimes(
    async () => {
      if (!address) {
        websocketConnection.status =
          WebsocketConnectionStatusEnum.NOT_INITIALIZED;
        return;
      }

      // To avoid multiple connections to the same endpoint
      websocketConnection.status = WebsocketConnectionStatusEnum.PENDING;

      const websocketUrl =
        customWebsocketUrl ?? (await getWebsocketUrl(apiAddress));

      if (!websocketUrl) {
        console.warn('Cannot get websocket URL');
        websocketConnection.status =
          WebsocketConnectionStatusEnum.NOT_INITIALIZED;
        return;
      }

      websocketConnection.instance = io(websocketUrl, {
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: RECONNECTION_ATTEMPTS,
        timeout: TIMEOUT,
        query: { address }
      });

      websocketConnection.instance.onAny(handleMessageReceived);

      websocketConnection.instance.on(BATCH_UPDATED_EVENT, handleBatchUpdate);

      websocketConnection.instance.on(CONNECT, () => {
        console.log('Websocket connected.');
        websocketConnection.status = WebsocketConnectionStatusEnum.COMPLETED;
      });

      websocketConnection.instance.on(CONNECT_ERROR, (error) => {
        console.warn('Websocket connect error: ', error.message);

        if (address) {
          retryWebsocketConnect();
        } else {
          websocketConnection.status =
            WebsocketConnectionStatusEnum.NOT_INITIALIZED;
        }
      });

      websocketConnection.instance.on(DISCONNECT, () => {
        if (address) {
          console.warn('Websocket disconnected. Trying to reconnect...');
          retryWebsocketConnect();
        } else {
          websocketConnection.status =
            WebsocketConnectionStatusEnum.NOT_INITIALIZED;
        }
      });
    },
    { retries: 2, delay: RETRY_INTERVAL }
  );

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
