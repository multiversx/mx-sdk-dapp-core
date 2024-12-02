import { getIsSequential } from './getIsSequential';

export function sequentialToFlatArray<T>({
  transactions = []
}: {
  transactions?: T[] | T[][];
}) {
  return getIsSequential<T>({ transactions })
    ? transactions.flat()
    : (transactions as T[]);
}
