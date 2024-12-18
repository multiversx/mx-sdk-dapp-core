import { Transaction } from '@multiversx/sdk-core';
import {
  MultiSignTransactionType,
  TransactionDataTokenType,
  TransactionsDataTokensType
} from 'types/transactions.types';
import { parseMultiEsdtTransferDataForMultipleTransactions } from './helpers/parseMultiEsdtTransferDataForMultipleTransactions';

const defaultTransactionInfo: TransactionDataTokenType = {
  tokenId: '',
  amount: '',
  type: '',
  multiTxData: '',
  receiver: ''
};

export function getMultiEsdtTransferData(transactions?: Transaction[]): {
  parsedTransactionsByDataField: TransactionsDataTokensType;
  getTxInfoByDataField: (
    data: string,
    multiTransactionData?: string
  ) => TransactionDataTokenType;
  allTransactions: MultiSignTransactionType[];
} {
  const { allTransactions, parsedTransactionsByDataField } =
    parseMultiEsdtTransferDataForMultipleTransactions({ transactions });

  function getTxInfoByDataField(
    data: string,
    multiTransactionData?: string
  ): TransactionDataTokenType {
    if (parsedTransactionsByDataField == null) {
      return defaultTransactionInfo;
    }

    if (data in parsedTransactionsByDataField) {
      return parsedTransactionsByDataField[data];
    }

    if (
      multiTransactionData != null &&
      String(multiTransactionData) in parsedTransactionsByDataField
    ) {
      return parsedTransactionsByDataField[multiTransactionData];
    }

    return defaultTransactionInfo;
  }

  return {
    parsedTransactionsByDataField,
    getTxInfoByDataField,
    allTransactions
  };
}
