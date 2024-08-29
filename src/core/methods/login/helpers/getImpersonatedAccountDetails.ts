import { getAccount } from 'utils/account/getAccount';
import { getModifiedLoginToken } from './getModifiedLoginToken';

interface GetImpersonatedAccountDetailsType {
  address: string;
  originalLoginToken?: string;
  extraInfoData: {
    multisig?: string;
    impersonate?: string;
  };
}

export const getImpersonatedAccountDetails = async ({
  originalLoginToken,
  extraInfoData,
  address
}: GetImpersonatedAccountDetailsType) => {
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
