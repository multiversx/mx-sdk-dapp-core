import axios from 'axios';
import { getCleanApiAddress } from 'store/slices/network/actions/getCleanApiAddress';
import { ApiNetworkConfigType } from 'types/network.types';
import { NETWORK_CONFIG_ENDPOINT } from '../endpoints';

const urlIsValid = (url: string) => {
  try {
    return Boolean(new URL(url));
  } catch {
    return false;
  }
};

export async function getNetworkConfigFromApi() {
  const apiAddress = getCleanApiAddress();

  if (!urlIsValid(apiAddress)) {
    return null;
  }

  const configUrl = `${apiAddress}/${NETWORK_CONFIG_ENDPOINT}`;

  try {
    const { data } = await axios.get<{
      data: { config: ApiNetworkConfigType };
    }>(configUrl);
    if (data != null) {
      return data?.data?.config;
    }
  } catch (err) {
    console.error('error fetching configuration for ', configUrl);
  }
  return null;
}
