import { getLatestNonce } from 'core/methods/account/getLatestNonce';
import { getNetworkConfig } from 'core/methods/network/getNetworkConfig';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { loginAction } from 'store/actions';
import { setAccount } from 'store/actions/account';
import { setLoginToken } from 'store/actions/loginInfo/loginInfoActions';
import { AccountType } from 'types/account.types';
import { getAccountFromToken } from './getAccountFromToken';

interface IExtractAccountFromTokenProps {
  loginToken: string;
  extraInfoData: {
    multisig?: string;
    impersonate?: string;
  };
  address: string;
  provider: IProvider;
}

export async function extractAccountFromToken({
  loginToken,
  extraInfoData,
  address,
  provider
}: IExtractAccountFromTokenProps) {
  const { apiAddress } = getNetworkConfig();

  const accountDetails = await getAccountFromToken({
    originalLoginToken: loginToken,
    extraInfoData,
    apiAddress,
    address
  });

  if (!accountDetails.account) {
    return accountDetails;
  }

  if (accountDetails.modifiedLoginToken) {
    setLoginToken(accountDetails.modifiedLoginToken);
  }

  loginAction({
    address: accountDetails.address,
    providerType: provider.getType()
  });

  const newAccount: AccountType = {
    ...accountDetails.account,
    nonce: getLatestNonce(accountDetails.account)
  };

  setAccount(newAccount);

  return {
    ...accountDetails,
    account: newAccount
  };
}
