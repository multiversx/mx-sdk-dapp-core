import { StoreType } from '../store';

export const accountSelector = ({
  account: { accounts, address }
}: StoreType) => accounts[address];

export const addressSelector = ({ account: { address } }: StoreType) => address;
