import { InterpretedTransactionType } from 'types/serverTransactions.types';
import {
  getOperationsMessages,
  getReceiptMessage
} from './getInterpretedTransaction';
import getScResultsMessages from './getInterpretedTransaction/helpers/getScResultsMessages';

export function getTransactionMessages(
  transaction: InterpretedTransactionType
) {
  const transactionMessages = Array.from(
    new Set([
      ...getScResultsMessages(transaction),
      ...getOperationsMessages(transaction),
      getReceiptMessage(transaction)
    ])
  ).filter((el) => Boolean(el));
  return transactionMessages;
}
