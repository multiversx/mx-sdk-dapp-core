import { StoreType } from 'store/store.types';

export const accountSelector = ({
  account: { accounts, address }
}: StoreType) => accounts[address];

export const addressSelector = ({ account: { address } }: StoreType) => address;

export const websocketEventSelector = ({
  account: { websocketEvent }
}: StoreType) => websocketEvent;

export const accountNonceSelector = (store: StoreType) =>
  accountSelector(store)?.nonce || 0;

export const isLoggedInSelector = (store: StoreType) => {
  const address = addressSelector(store);
  const account = accountSelector(store);
  return Boolean(address && account?.address === address);
};
