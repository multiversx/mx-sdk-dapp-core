import { setAccount } from 'store/actions/account';
import { setLoginToken } from 'store/actions/loginInfo/loginInfoActions';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { loginAction } from 'store/actions';
import { AccountType } from 'types/account.types';
import { getAccountFromToken } from './getAccountFromToken';
import { getLatestNonce } from 'core/methods/account/getLatestNonce';

export async function extractAccountFromToken({
  loginToken,
  extraInfoData,
  address,
  provider
}: {
  loginToken: string;
  extraInfoData: {
    multisig?: string;
    impersonate?: string;
  };
  address: string;
  provider: IProvider;
}) {
  const accountDetails = await getAccountFromToken({
    originalLoginToken: loginToken,
    extraInfoData,
    address
  });

  if (accountDetails.modifiedLoginToken) {
    setLoginToken(accountDetails.modifiedLoginToken);
  }

  if (accountDetails.account) {
    // TODO remove this as is already done before this function is called
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

  return accountDetails;
}
