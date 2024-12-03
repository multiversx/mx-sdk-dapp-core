export function removeTransactionsToSign(sessionId: string) {
  store.dispatch(clearSignedTransaction(sessionId));
}
export function removeSignedTransaction(sessionId: string) {
  store.dispatch(clearSignedTransaction(sessionId));

  const account = accountSelector(store.getState());
  store.dispatch(
    clearBatchTransactions({
      batchId: buildBatchId({
        sessionId,
        address: account?.address ?? ''
      })
    })
  );
}

export function deleteTransactionToast(sessionId: string) {
  store.dispatch(removeTransactionToast(sessionId));
  removeSignedTransaction(sessionId);
}

export function removeAllSignedTransactions() {
  store.dispatch(clearAllSignedTransactions());
}

export function removeAllTransactionsToSign() {
  store.dispatch(clearAllTransactionsToSign());
}

export function removeBatchTransactions(batchId: string) {
  store.dispatch(clearBatchTransactions({ batchId }));
}
