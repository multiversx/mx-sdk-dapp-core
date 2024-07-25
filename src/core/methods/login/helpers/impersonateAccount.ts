import { setAccount } from 'store/actions/account';
import { setLoginToken } from 'store/actions/loginInfo/loginInfoActions';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { loginAction } from 'store/actions';
import { AccountType } from 'types/account.types';
import { getImpersonatedAccountDetails } from './getImpersonatedAccountDetails';
import { getLatestNonce } from 'core/methods/account/getLatestNonce';

export async function impersonateAccount({
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
  const impersonationDetails = await getImpersonatedAccountDetails({
    originalLoginToken: loginToken,
    extraInfoData,
    address
  });

  if (impersonationDetails?.modifiedLoginToken) {
    setLoginToken(impersonationDetails.modifiedLoginToken);
  }

  if (impersonationDetails?.account) {
    loginAction({
      address: impersonationDetails.address,
      providerType: provider.getType()
    });

    const newAccount: AccountType = {
      ...impersonationDetails.account,
      nonce: getLatestNonce(impersonationDetails.account)
    };

    setAccount(newAccount);
  }

  return impersonationDetails;
}
