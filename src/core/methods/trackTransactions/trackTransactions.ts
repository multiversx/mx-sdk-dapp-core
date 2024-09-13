import { getTransactionsByHashes as defaultGetTxByHash } from 'apiCalls/transactions/getTransactionsByHashes';
import { TransactionsTrackerType } from './trackTransactions.types';
import { getPollingInterval } from './helpers/getPollingInterval';
import { checkTransactionStatus } from './helpers/checkTransactionStatus';
import {
  websocketConnection,
  WebsocketConnectionStatusEnum
} from '../initApp/websocket/websocket.constants';
import { getStore } from 'store/store';

export async function trackTransactions(props?: TransactionsTrackerType) {
  const store = getStore();
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

  console.log({
    isWebsocketCompleted
  });

  if (isWebsocketCompleted) {
    console.log('\x1b[42m%s\x1b[0m', 'setting up subscribe');

    // Do not set polling interval if websocket is complete
    if (pollingIntervalTimer) {
      clearInterval(pollingIntervalTimer);
      pollingIntervalTimer = null;
    }
    store.subscribe(async ({ account: { websocketEvent } }) => {
      console.log('websocketEvent', websocketEvent);

      if (websocketEvent?.message) {
        console.log(
          '\x1b[42m%s\x1b[0m',
          'trackTransactions -> websocketEvent.message',
          websocketEvent.message
        );

        onMessage();
      }
    });
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
