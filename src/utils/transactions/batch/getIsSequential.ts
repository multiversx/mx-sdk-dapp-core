export function getIsSequential<T>({
  transactions
}: {
  transactions?: T[] | T[][];
}) {
  return transactions?.some((transaction) => Array.isArray(transaction));
}
