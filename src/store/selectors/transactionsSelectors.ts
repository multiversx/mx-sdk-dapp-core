import { Transaction } from '@multiversx/sdk-core';

import { StoreType } from 'store/store.types';
import {
  getIsTransactionFailed,
  getIsTransactionPending,
  getIsTransactionSuccessful,
  getIsTransactionTimedOut
} from 'utils/transactions';
import {
  CustomTransactionInformation,
  RawTransactionType,
  SignedTransactionsType
} from '../../types';

export const accountSelector = ({
  transactions: { accounts, address }
}: StoreType) => accounts[address];

export const signedTransactionsSelector = createDeepEqualSelector(
  transactionsSelectors,
  (state) => state.signedTransactions as SignedTransactionsType
);

export const signTransactionsErrorSelector = createDeepEqualSelector(
  transactionsSelectors,
  (state) => state.signTransactionsError
);

export const signTransactionsCancelMessageSelector = createDeepEqualSelector(
  transactionsSelectors,
  (state) => state.signTransactionsCancelMessage
);

const selectTxByStatus =
  (txStatusVerifier: typeof getIsTransactionPending) =>
  (signedTransactions: SignedTransactionsType) =>
    Object.entries(signedTransactions).reduce((acc, [sessionId, txBody]) => {
      if (txStatusVerifier(txBody.status)) {
        acc[sessionId] = txBody;
      }
      return acc;
    }, {} as SignedTransactionsType);

export const pendingSignedTransactionsSelector = createDeepEqualSelector(
  signedTransactionsSelector,
  selectTxByStatus(getIsTransactionPending)
);

export const successfulTransactionsSelector = createDeepEqualSelector(
  signedTransactionsSelector,
  selectTxByStatus(getIsTransactionSuccessful)
);

export const failedTransactionsSelector = createDeepEqualSelector(
  signedTransactionsSelector,
  selectTxByStatus(getIsTransactionFailed)
);

export const timedOutTransactionsSelector = createDeepEqualSelector(
  signedTransactionsSelector,
  selectTxByStatus(getIsTransactionTimedOut)
);

export const transactionsToSignSelector = createDeepEqualSelector(
  transactionsSelectors,
  (state): TransactionsToSignReturnType | null => {
    if (state?.transactionsToSign == null) {
      return null;
    }
    return {
      ...state.transactionsToSign,
      transactions:
        state?.transactionsToSign?.transactions.map((tx: RawTransactionType) =>
          newTransaction(tx)
        ) || []
    };
  }
);

export const transactionStatusSelector = createDeepEqualSelector(
  signedTransactionsSelector,
  (_: RootState, transactionSessionId: string | null) => transactionSessionId,
  (
    signedTransactions: SignedTransactionsType,
    transactionSessionId: string | null
  ) =>
    transactionSessionId != null
      ? signedTransactions?.[transactionSessionId] || {}
      : {}
);
