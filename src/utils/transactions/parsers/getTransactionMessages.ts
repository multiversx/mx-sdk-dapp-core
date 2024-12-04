import { InterpretedTransactionType } from 'types/serverTransactions.types';
import {
  getOperationsMessages,
  getReceiptMessage,
  getScResultsMessages
} from './getInterpretedTransaction';

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
