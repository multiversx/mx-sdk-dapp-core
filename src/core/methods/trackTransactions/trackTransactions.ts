import { subscriptions } from 'constants/storage.constants';
import { websocketEventSelector } from 'store/selectors/accountSelectors';
import { getStore } from 'store/store';
import { SubscriptionsEnum } from 'types/subscriptions.type';
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
  // eslint-disable-next-line no-undef
  let websocketStatusCheckTimer: NodeJS.Timeout | null = null;
  let timestamp = websocketEventSelector(store.getState())?.timestamp;

  const recheckStatus = () => {
    checkTransactionStatus();
  };

  const startPolling = () => {
    if (!pollingIntervalTimer) {
      pollingIntervalTimer = setInterval(recheckStatus, pollingInterval);
    }
  };

  const stopPolling = () => {
    if (pollingIntervalTimer) {
      clearInterval(pollingIntervalTimer);
      pollingIntervalTimer = null;
    }
  };

  const setupWebSocketTracking = () => {
    stopPolling();
    const unsubscribeWebsocketEvent = store.subscribe(
      ({ account: { websocketEvent } }) => {
        if (websocketEvent?.message && timestamp !== websocketEvent.timestamp) {
          timestamp = websocketEvent.timestamp;
          recheckStatus();
        }
      }
    );

    subscriptions.set(
      SubscriptionsEnum.websocketEvent,
      unsubscribeWebsocketEvent
    );
  };

  const startWatchingWebsocketStatus = () => {
    if (
      websocketConnection.status !==
        WebsocketConnectionStatusEnum.NOT_INITIALIZED ||
      websocketStatusCheckTimer
    ) {
      return;
    }

    websocketStatusCheckTimer = setInterval(() => {
      if (
        websocketConnection.status === WebsocketConnectionStatusEnum.COMPLETED
      ) {
        clearInterval(websocketStatusCheckTimer!);
        websocketStatusCheckTimer = null;
        setupWebSocketTracking();
      }
    }, 1000);
  };

  // Initial execution
  recheckStatus();

  function cleanup() {
    stopPolling();
    if (websocketStatusCheckTimer) {
      clearInterval(websocketStatusCheckTimer);
      websocketStatusCheckTimer = null;
    }
  }

  const unsubscribeWebsocketStatus = store.subscribe(
    ({ account: { websocketStatus, address } }, prevState) => {
      const hasStatusChange =
        prevState.account.websocketStatus !== websocketStatus;

      if (!hasStatusChange) {
        return;
      }

      switch (websocketStatus) {
        case WebsocketConnectionStatusEnum.COMPLETED:
          setupWebSocketTracking();
          break;
        case WebsocketConnectionStatusEnum.PENDING:
          startPolling();
          startWatchingWebsocketStatus();
          break;
        default:
          {
            if (address) {
              startPolling();
            } else {
              cleanup();
            }
          }
          break;
      }
    }
  );

  subscriptions.set(
    SubscriptionsEnum.websocketStatus,
    unsubscribeWebsocketStatus
  );
  subscriptions.set(SubscriptionsEnum.websocketCleanup, cleanup);
  return { cleanup };
}
