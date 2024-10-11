import { initializeWebsocketConnection } from './initializeWebsocketConnection';
import { getStore } from 'store/store';
import { getAccount } from 'core/methods/account/getAccount';

let localAddress = '';
let closeConnectionRef: () => void;

export async function registerWebsocketListener() {
  const store = getStore();
  const account = getAccount();
  localAddress = account.address;

  // Initialize the websocket connection
  const data = await initializeWebsocketConnection();
  closeConnectionRef = data.closeConnection;

  store.subscribe(async ({ account: { address } }) => {
    if (localAddress && address !== localAddress) {
      closeConnectionRef();
      localAddress = address;
      const { closeConnection } = await initializeWebsocketConnection();
      closeConnectionRef = closeConnection;
    }
  });
}
