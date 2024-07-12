import { StoreType } from 'store/store.types';

export const accountSelector = ({
  account: { accounts, address }
}: StoreType) => accounts[address];

export const addressSelector = ({ account: { address } }: StoreType) => address;
