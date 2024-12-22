import { axiosInstance } from 'apiCalls/utils/axiosInstance';

export async function getWebsocketUrl(apiAddress: string) {
  try {
    const { data } = await axiosInstance.get<{ url: string }>(
      `${apiAddress}/websocket/config`
    );
    return `wss://${data.url}`;
  } catch (err) {
    console.error(err);
    throw new Error('Can not get websocket url');
  }
}
