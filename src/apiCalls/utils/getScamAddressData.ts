import axios from 'axios';
import { ScamInfoType } from 'types/account.types';
import { ACCOUNTS_ENDPOINT } from '../endpoints';
import { networkSelector } from 'store/selectors';
import { getState } from 'store/store';

export async function getScamAddressData(addressToVerify: string) {
  const { apiAddress, apiTimeout } = networkSelector(getState());

  const { data } = await axios.get<{
    scamInfo?: ScamInfoType;
    code?: string;
  }>(`${apiAddress}/${ACCOUNTS_ENDPOINT}/${addressToVerify}`, {
    timeout: Number(apiTimeout)
  });

  return data;
}
