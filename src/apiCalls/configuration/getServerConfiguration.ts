import axios from 'axios';
import { NetworkType } from 'types/network.types';
import { CONFIG_ENDPOINT } from '../endpoints';

export async function getServerConfiguration(apiAddress: string) {
  const configUrl = `${apiAddress}/${CONFIG_ENDPOINT}`;

  try {
    const { data } = await axios.get<NetworkType>(configUrl);
    return data;
  } catch (err) {
    console.error('error fetching configuration for ', configUrl);
  }
  return null;
}
