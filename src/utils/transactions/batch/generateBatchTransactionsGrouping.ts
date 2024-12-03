export function generateBatchTransactionsGrouping<T>(transactions: T[][]) {
  let indexInFlatArray = 0;
  return transactions.map((group) => {
    return group.map(() => indexInFlatArray++);
  });
}
