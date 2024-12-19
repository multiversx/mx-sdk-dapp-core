import axios from 'axios';
import { ECONOMICS_ENDPOINT } from 'apiCalls/endpoints';
import { getCleanApiAddress } from 'apiCalls/utils/getCleanApiAddress';

export interface EconomicsInfoType {
  totalSupply: number;
  circulatingSupply: number;
  staked: number;
  price: number;
  marketCap: number;
  apr: number;
  topUpApr: number;
}

export async function getEconomics(url = ECONOMICS_ENDPOINT) {
  const apiAddress = getCleanApiAddress();
  const configUrl = `${apiAddress}/${url}`;
  try {
    const { data } = await axios.get<EconomicsInfoType>(configUrl);
    return data;
  } catch (err) {
    console.error('err fetching economics info', err);
    return null;
  }
}
