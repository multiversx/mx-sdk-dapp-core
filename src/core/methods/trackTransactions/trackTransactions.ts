import { websocketEventSelector } from 'store/selectors/accountSelectors';
import { getStore } from 'store/store';
import { checkTransactionStatus } from './helpers/checkTransactionStatus';
import { getPollingInterval } from './helpers/getPollingInterval';
import {
  websocketConnection,
  WebsocketConnectionStatusEnum
} from '../initApp/websocket/websocket.constants';

/**
 * Tracks transactions using websocket or polling
 * @returns cleanup function
 */
export async function trackTransactions() {
  const store = getStore();
  const pollingInterval = getPollingInterval();
  // eslint-disable-next-line no-undef
  let pollingIntervalTimer: NodeJS.Timeout | null = null;
  let timestamp = websocketEventSelector(store.getState())?.timestamp;

  const isWebsocketCompleted =
    websocketConnection.status === WebsocketConnectionStatusEnum.COMPLETED;

  const recheckStatus = () => {
    checkTransactionStatus();
  };

  recheckStatus();

  if (isWebsocketCompleted) {
    // Do not set polling interval if websocket is complete
    if (pollingIntervalTimer) {
      clearInterval(pollingIntervalTimer);
      pollingIntervalTimer = null;
    }
    store.subscribe(async ({ account: { websocketEvent } }) => {
      if (websocketEvent?.message && timestamp !== websocketEvent.timestamp) {
        timestamp = websocketEvent.timestamp;
        recheckStatus();
      }
    });
  } else {
    // Set polling interval if websocket is not complete and no existing interval is set
    if (!pollingIntervalTimer) {
      pollingIntervalTimer = setInterval(recheckStatus, pollingInterval);
    }
  }

  function cleanup() {
    if (pollingIntervalTimer) {
      clearInterval(pollingIntervalTimer);
      pollingIntervalTimer = null;
    }
  }

  return {
    cleanup
  };
}
