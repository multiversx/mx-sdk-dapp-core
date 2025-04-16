import { initializeWebsocketConnection } from './initializeWebsocketConnection';

// Execute on logout in order to close the connection
export let closeConnectionRef: () => void;

export async function registerWebsocketListener(address: string) {
  const { closeConnection } = await initializeWebsocketConnection(address);

  closeConnectionRef = closeConnection;
}
