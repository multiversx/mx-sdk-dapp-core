import { Address } from '@multiversx/sdk-core/out';
import { getStore } from '../../store';
import { LoginMethodsEnum } from 'types/enums.types';
import { resetStore } from 'store/middleware/logoutMiddleware';

export const logoutAction = () => getStore().setState(resetStore);
export interface LoginActionPayloadType {
  address: string;
  loginMethod: LoginMethodsEnum;
}

export const loginAction = ({ address, loginMethod }: LoginActionPayloadType) =>
  getStore().setState(({ account, loginInfo }) => {
    account.address = address;
    account.publicKey = new Address(address).hex();
    loginInfo.loginMethod = loginMethod;
  });
