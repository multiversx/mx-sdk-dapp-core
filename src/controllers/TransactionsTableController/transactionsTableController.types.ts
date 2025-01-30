import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  TransactionAgeType,
  TransactionMethodType
} from 'types/serverTransactions.types';

export interface TransactionsTableRowType {
  age: TransactionAgeType;
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
  name: string;
  description: string;
  isContract: boolean;
  isTokenLocked: boolean;
  link: string;
  showLink: boolean;
}
