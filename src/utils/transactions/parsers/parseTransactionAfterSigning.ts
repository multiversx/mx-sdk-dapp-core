import { Transaction, TransactionPayload } from '@multiversx/sdk-core/out';
import { PlainSignedTransaction } from '@multiversx/sdk-web-wallet-provider/out/plainSignedTransaction';
import { SignedTransactionType } from 'types';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { isGuardianTx } from '../validation';

export function parseTransactionAfterSigning(
  signedTransaction: Transaction | PlainSignedTransaction
) {
  const isComplexTransaction =
    Object.getPrototypeOf(signedTransaction).toPlainObject != null;

  const plainSignedTx = signedTransaction as PlainSignedTransaction;
  const encoder = new TextEncoder();

  const transaction = isComplexTransaction
    ? (signedTransaction as Transaction)
    : new Transaction({
        ...plainSignedTx,
        data: new TransactionPayload(plainSignedTx.data),
        signature: encoder.encode(plainSignedTx.signature),
        guardianSignature: encoder.encode(plainSignedTx.guardianSignature)
      });

  const parsedTransaction: SignedTransactionType = {
    ...transaction.toPlainObject(),
    hash: transaction.getHash().hex(),
    senderUsername: transaction.getSenderUsername().valueOf(),
    receiverUsername: transaction.getReceiverUsername().valueOf(),
    status: TransactionServerStatusesEnum.pending
  };

  // TODO: Remove when the protocol supports usernames for guardian transactions
  if (isGuardianTx({ data: parsedTransaction.data, onlySetGuardian: true })) {
    delete parsedTransaction.senderUsername;
    delete parsedTransaction.receiverUsername;
  }

  return parsedTransaction;
}
