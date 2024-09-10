import { initial } from 'lodash';
import { BatchTransactionsWSResponseType } from './websocket.constants';
import {
  initializeWebsocketConnection,
  IWebsocketHandlerOptions
} from './initializeWebsocketConnection';
import { getStore } from 'store/store';
import { getAccount } from 'core/methods/account/getAccount';

let localAddress = '';
let closeConnectionRef: () => void;

export const registerWebsocketListener = async (
  props: IWebsocketHandlerOptions
) => {
  const store = getStore();
  const account = getAccount();
  localAddress = account.address;

  // Initialize the websocket connection
  const data = await initializeWebsocketConnection(props);
  closeConnectionRef = data.closeConnection;

  store.subscribe(
    async ({ account: { address, websocketEvent, websocketBatchEvent } }) => {
      if (websocketEvent?.message) {
        props.onMessageReceived(websocketEvent.message);
      }

      if (websocketBatchEvent?.data && props.onBatchUpdate) {
        props.onBatchUpdate(websocketBatchEvent.data);
      }

      if (localAddress && address !== localAddress) {
        closeConnectionRef();
        localAddress = address;
        const { closeConnection } = await initializeWebsocketConnection(props);
        closeConnectionRef = closeConnection;
      }
    }
  );
};
