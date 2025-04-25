import { fetchAccount } from 'utils/account/fetchAccount';
import { getModifiedLoginToken } from './getModifiedLoginToken';

interface GetAccountFromTokenType {
  address: string;
  apiAddress: string;
  originalLoginToken?: string;
  extraInfoData: {
    multisig?: string;
    impersonate?: string;
  };
}

export async function getAccountFromToken({
  originalLoginToken,
  extraInfoData,
  apiAddress,
  address
}: GetAccountFromTokenType) {
  const modifiedLoginToken = await getModifiedLoginToken({
    loginToken: originalLoginToken,
    extraInfoData
  });

  const tokenAddress =
    extraInfoData.multisig || extraInfoData.impersonate || address;

  const accountAddress = modifiedLoginToken != null ? tokenAddress : address;

  const account = await fetchAccount({
    address: accountAddress,
    baseURL: apiAddress
  });

  return {
    account,
    address: accountAddress,
    modifiedLoginToken
  };
}
