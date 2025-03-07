import { Transaction } from '@multiversx/sdk-core';
import {
  IMultiSignTransaction,
  ITransactionDataToken,
  TransactionsDataTokensType
} from 'types/transactions.types';
import { parseMultiEsdtTransferDataForMultipleTransactions } from './helpers/parseMultiEsdtTransferDataForMultipleTransactions';

const defaultTransactionInfo: ITransactionDataToken = {
  tokenId: '',
  amount: '',
  type: '',
  multiTxData: '',
  receiver: ''
};

export type MultiEsdtTransferDataReturnType = ReturnType<
  typeof getMultiEsdtTransferData
>;

export function getMultiEsdtTransferData(transactions?: Transaction[]): {
  parsedTransactionsByDataField: TransactionsDataTokensType;
  getTxInfoByDataField: (
    data: string,
    multiTransactionData?: string
  ) => ITransactionDataToken;
  allTransactions: IMultiSignTransaction[];
} {
  const { allTransactions, parsedTransactionsByDataField } =
    parseMultiEsdtTransferDataForMultipleTransactions({ transactions });

  function getTxInfoByDataField(
    data: string,
    multiTransactionData?: string
  ): ITransactionDataToken {
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
