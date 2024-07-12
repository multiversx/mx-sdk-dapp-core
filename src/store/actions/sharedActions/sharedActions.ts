import { Address } from '@multiversx/sdk-core/out';
import { initialState as initialAccountState } from 'store/slices/account/accountSlice';
import { getStore } from '../../store';

export const logout = () =>
  getStore().setState((state) => {
    state.account = initialAccountState;
  });

export const login = (address: string) =>
  getStore().setState(({ account }) => {
    account.address = address;
    account.publicKey = new Address(address).hex();
  });
