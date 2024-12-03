import { StoreType } from 'store/store.types';
import {
  getIsTransactionFailed,
  getIsTransactionPending,
  getIsTransactionSuccessful,
  getIsTransactionTimedOut,
  newTransaction
} from 'utils/transactions';
import {
  CustomTransactionInformation,
  RawTransactionType,
  SignedTransactionsType
} from '../../types';

export const signedTransactionsSelector = ({ transactions }: StoreType) =>
  transactions.signedTransactions;

export const signTransactionsErrorSelector = ({ transactions }: StoreType) =>
  transactions.signTransactionsError;

export const signTransactionsCancelMessageSelector = ({
  transactions
}: StoreType) => transactions.signTransactionsCancelMessage;

const selectTxByStatus =
  (txStatusVerifier: typeof getIsTransactionPending) => (store: StoreType) => {
    const signedTransactions = signedTransactionsSelector(store);

    return Object.entries(signedTransactions).reduce(
      (acc, [sessionId, txBody]) => {
        if (txStatusVerifier(txBody.status)) {
          acc[sessionId] = txBody;
        }
        return acc;
      },
      {} as SignedTransactionsType
    );
  };

export const pendingSignedTransactionsSelector = selectTxByStatus(
  getIsTransactionPending
);

export const successfulTransactionsSelector = selectTxByStatus(
  getIsTransactionSuccessful
);

export const failedTransactionsSelector = selectTxByStatus(
  getIsTransactionFailed
);

export const timedOutTransactionsSelector = selectTxByStatus(
  getIsTransactionTimedOut
);

export const transactionsToSignSelector = ({ transactions }: StoreType) => {
  const transactionsToSign = transactions.transactionsToSign;

  if (transactionsToSign == null) {
    return null;
  }

  return {
    ...transactionsToSign,
    transactions:
      transactionsToSign?.transactions.map((tx: RawTransactionType) =>
        newTransaction(tx)
      ) || []
  };
};

export const transactionStatusSelector =
  (transactionSessionId: number) => (store: StoreType) => {
    const signedTransactions = signedTransactionsSelector(store);

    return signedTransactions.transactionSessionId != null
      ? signedTransactions?.[transactionSessionId] || {}
      : {};
  };
