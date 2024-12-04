import { getAccount } from 'core/methods/account/getAccount';
import { getStore } from 'store/store';
import { initializeWebsocketConnection } from './initializeWebsocketConnection';

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
