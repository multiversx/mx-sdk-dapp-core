import axios from 'axios';
import { getCleanApiAddress } from 'apiCalls/utils';
import { TIMEOUT } from 'constants/index';
import { ScamInfoType } from 'types/account.types';
import { ACCOUNTS_ENDPOINT } from '../endpoints';

export async function getScamAddressData(addressToVerify: string) {
  const apiAddress = getCleanApiAddress();

  const { data } = await axios.get<{
    scamInfo?: ScamInfoType;
    code?: string;
  }>(`${apiAddress}/${ACCOUNTS_ENDPOINT}/${addressToVerify}`, {
    timeout: TIMEOUT
  });

  return data;
}
