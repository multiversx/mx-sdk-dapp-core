import { getLatestNonce } from 'core/methods/account/getLatestNonce';
import { registerWebsocketListener } from 'core/methods/initApp/websocket/registerWebsocket';
import { trackTransactions } from 'core/methods/trackTransactions/trackTransactions';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { loginAction } from 'store/actions';
import { setAccount } from 'store/actions/account';
import { AccountType } from 'types/account.types';
import { fetchAccount } from 'utils/account/fetchAccount';

interface IAccountLoginProps {
  address: string;
  provider: IProvider;
  apiAddress: string;
}

export async function accountLogin({
  address,
  provider,
  apiAddress
}: IAccountLoginProps) {
  const account = await fetchAccount({
    address,
    baseURL: apiAddress
  });

  if (!account) {
    throw new Error('Account not found');
  }

  loginAction({
    address: account.address,
    providerType: provider.getType()
  });

  const newAccount: AccountType = {
    ...account,
    nonce: getLatestNonce(account)
  };

  setAccount(newAccount);

  await registerWebsocketListener(address);
  trackTransactions();
}
