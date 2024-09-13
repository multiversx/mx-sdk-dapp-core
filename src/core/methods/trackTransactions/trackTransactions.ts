import { getTransactionsByHashes as defaultGetTxByHash } from 'apiCalls/transactions/getTransactionsByHashes';
import { TransactionsTrackerType } from './trackTransactions.types';
import { getPollingInterval } from './helpers/getPollingInterval';
import { checkTransactionStatus } from './helpers/checkTransactionStatus';
import {
  websocketConnection,
  WebsocketConnectionStatusEnum
} from '../initApp/websocket/websocket.constants';
import { getStore } from 'store/store';
import { websocketEventSelector } from 'store/selectors/accountSelectors';

/**
 * Tracks transactions using websocket or polling
 * @param props - optional object with additional websocket parameters
 * @returns cleanup function
 */
export async function trackTransactions(props?: TransactionsTrackerType) {
  const store = getStore();
  const pollingInterval = getPollingInterval();
  let pollingIntervalTimer: NodeJS.Timeout | null = null;
  let timestamp = websocketEventSelector(store.getState())?.timestamp;

  // Check if websocket is completed
  const isWebsocketCompleted =
    websocketConnection.status === WebsocketConnectionStatusEnum.COMPLETED;

  // Assign getTransactionsByHash based on props or use default
  const getTransactionsByHash =
    props?.getTransactionsByHash ?? defaultGetTxByHash;

  // Function that handles message (checking transaction status)
  const recheckStatus = () => {
    checkTransactionStatus({
      shouldRefreshBalance: isWebsocketCompleted,
      getTransactionsByHash,
      ...props
    });
  };

  // recheck on page initial page load
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

  // Return cleanup function for clearing the interval
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
