import { getAccount } from 'utils/account/getAccount';
import { getModifiedLoginToken } from './getModifiedLoginToken';

interface GetAccountFromTokenType {
  address: string;
  originalLoginToken?: string;
  extraInfoData: {
    multisig?: string;
    impersonate?: string;
  };
}

export const getAccountFromToken = async ({
  originalLoginToken,
  extraInfoData,
  address
}: GetAccountFromTokenType) => {
  const modifiedLoginToken = await getModifiedLoginToken({
    loginToken: originalLoginToken,
    extraInfoData
  });

  const tokenAddress =
    extraInfoData.multisig || extraInfoData.impersonate || address;

  const accountAddress = modifiedLoginToken != null ? tokenAddress : address;

  const account = await getAccount(accountAddress);

  return {
    account,
    address: accountAddress,
    modifiedLoginToken
  };
};
