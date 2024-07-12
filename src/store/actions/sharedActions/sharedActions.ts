import { Address } from '@multiversx/sdk-core/out';
import { initialState as initialAccountState } from 'store/slices/account/accountSlice';
import { store } from '../../store';

export const logout = () =>
  store.setState((state) => {
    state.account = initialAccountState;
  });

export const login = (address: string) =>
  store.setState(({ account }) => {
    account.address = address;
    account.publicKey = new Address(address).hex();
  });
