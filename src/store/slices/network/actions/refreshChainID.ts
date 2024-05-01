import { getNetworkConfigFromApi } from '../../../../apiCalls/configuration/getNetworkConfigFromApi';
import { store } from '../network';

export async function refreshChainID() {
  try {
    const networkConfig = await getNetworkConfigFromApi();
    if (networkConfig) {
      store.getState().setChainID(networkConfig.erd_chain_id);
    }
  } catch (err) {
    console.error('failed refreshing chainId ', err);
  }
}
