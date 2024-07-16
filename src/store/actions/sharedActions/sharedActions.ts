import { Address } from '@multiversx/sdk-core/out';
import { store } from '../../store';
import { LoginMethodsEnum } from 'types/enums.types';
import { resetStore } from 'store/middleware/logoutMiddleware';

export const logoutAction = () => store.setState(resetStore);
export interface LoginActionPayloadType {
  address: string;
  loginMethod: LoginMethodsEnum;
}

export const loginAction = ({ address, loginMethod }: LoginActionPayloadType) =>
  store.setState(({ account, loginInfo }) => {
    account.address = address;
    account.publicKey = new Address(address).hex();
    loginInfo.loginMethod = loginMethod;
  });
