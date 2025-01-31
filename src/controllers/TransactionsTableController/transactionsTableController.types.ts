import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  TransactionAgeType,
  TransactionMethodType
} from 'types/serverTransactions.types';

export interface TransactionsTableRowType {
  age: TransactionAgeType;
  direction?: string;
  method: TransactionMethodType;
  iconInfo: TransactionIconInfoType;
  link: string;
  receiver: TransactionAccountType;
  sender: TransactionAccountType;
  txHash: string;
}

export interface TransactionIconInfoType {
  icon?: IconDefinition;
  tooltip: string;
}

export interface TransactionAccountType {
  address: string;
  description: string;
  isContract: boolean;
  isTokenLocked: boolean;
  link: string;
  name: string;
  shard?: string;
  shardLink?: string;
  showLink: boolean;
}
