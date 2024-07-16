import { Address } from '@multiversx/sdk-core/out';
import { initialState as initialAccountState } from 'store/slices/account/accountSlice';
import { initialState as initialLoginInfoState } from 'store/slices/loginInfo/loginInfoSlice';
import { getState, store } from '../../store';
import { LoginMethodsEnum } from 'types/enums.types';
import { updateLoginExpiresAt } from '../loginInfo/loginInfoActions';

store.subscribe(
  (state) => ({ account: state.account, network: state.network }), // only listen to changes in account and network
  ({ account }) => {
    const isLoggedIn = Boolean(account.address);
    const loginTimestamp = getState().loginInfo.loginExpiresAt;

    if (!isLoggedIn || loginTimestamp == null) {
      return;
    }

    const isExpired = loginTimestamp - Date.now() < 0;

    if (isExpired) {
      logoutAction();
      return;
    }

    updateLoginExpiresAt();
  }
);

export const logoutAction = () =>
  store.setState((store) => {
    store.account = initialAccountState;
    store.loginInfo = initialLoginInfoState;
    updateLoginExpiresAt(null);
  });

export interface LoginActionPayloadType {
  address: string;
  loginMethod: LoginMethodsEnum;
}

export const loginAction = ({ address, loginMethod }: LoginActionPayloadType) =>
  store.setState(({ account, loginInfo }) => {
    account.address = address;
    account.publicKey = new Address(address).hex();
    loginInfo.loginMethod = loginMethod;
    updateLoginExpiresAt();
  });
