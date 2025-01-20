import { StoreType } from 'store/store.types';

const privateAccountInfoSelector = ({ account }: StoreType) => account;

export const accountSelector = ({
  account: { accounts, address }
}: StoreType) => accounts[address];

export const accountInfoSelector = (state: StoreType) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { accounts, ...info } = privateAccountInfoSelector(state);
  const account = accountSelector(state);

  return { ...info, address: account.address, account };
};

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
