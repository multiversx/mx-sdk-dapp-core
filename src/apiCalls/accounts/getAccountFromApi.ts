import { ACCOUNTS_ENDPOINT } from 'apiCalls/endpoints';
import { axiosInstance } from 'apiCalls/utils/axiosInstance';
import { getCleanApiAddress } from 'apiCalls/utils/getCleanApiAddress';

export const accountFetcher = (address: string | null) => {
  const apiAddress = getCleanApiAddress();
  const url = `${apiAddress}/${ACCOUNTS_ENDPOINT}/${address}?withGuardianInfo=true`;
  // we need to get it with an axios instance because of cross-window user interaction issues
  return axiosInstance.get(url);
};

export const getAccountFromApi = async (address?: string) => {
  if (!address) {
    return null;
  }

  try {
    const { data } = await accountFetcher(address);
    return data;
  } catch (err) {
    console.error('error fetching configuration for ', address);
  }

  return null;
};