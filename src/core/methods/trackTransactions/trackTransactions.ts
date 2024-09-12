import { getTransactionsByHashes as defaultGetTxByHash } from 'apiCalls/transactions/getTransactionsByHashes';
import { TransactionsTrackerType } from './trackTransactions.types';
import { getPollingInterval } from './helpers/getPollingInterval';
import { checkTransactionStatus } from './helpers/checkTransactionStatus';
import {
  websocketConnection,
  WebsocketConnectionStatusEnum
} from '../initApp/websocket/websocket.constants';
import { registerWebsocketListener } from '../initApp/websocket/registerWebsocket';

export function trackTransactions(props?: TransactionsTrackerType) {
  const checkStatus = checkTransactionStatus();
  const pollingInterval = getPollingInterval();
  let pollingIntervalTimer: NodeJS.Timeout | null = null;

  // Check if websocket is completed
  const isWebsocketCompleted =
    websocketConnection.status === WebsocketConnectionStatusEnum.COMPLETED;

  // Assign getTransactionsByHash based on props or use default
  const getTransactionsByHash =
    props?.getTransactionsByHash ?? defaultGetTxByHash;

  // Function that handles message (checking transaction status)
  const onMessage = () => {
    checkStatus({
      shouldRefreshBalance: isWebsocketCompleted,
      getTransactionsByHash,
      ...props
    });
  };

  registerWebsocketListener({ onMessageReceived: onMessage });

  // Simulate the logic that would be within useEffect
  if (isWebsocketCompleted) {
    // Do not set polling interval if websocket is complete
    if (pollingIntervalTimer) {
      clearInterval(pollingIntervalTimer);
      pollingIntervalTimer = null;
    }
  } else {
    // Set polling interval if websocket is not complete and no existing interval is set
    if (!pollingIntervalTimer) {
      pollingIntervalTimer = setInterval(onMessage, pollingInterval);
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
