import { Address } from '@multiversx/sdk-core/out';
import { initialState as initialAccountState } from 'store/slices/account/accountSlice';
import { initialState as initialLoginInfoState } from 'store/slices/loginInfo/loginInfoSlice';
import { store } from '../../store';
import { LoginMethodsEnum } from 'types/enums.types';

export const logoutAction = () =>
  store.setState((store) => {
    store.account = initialAccountState;
    store.loginInfo = initialLoginInfoState;
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
    // setLoginExpiresAt(getNewLoginExpiresTimestamp());
  });
