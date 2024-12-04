// TODO: Move to utils
export function getAllStringOccurrences(sourceStr: string, searchStr: string) {
  if (!sourceStr || !searchStr) {
    return [];
  }

  const startingIndices = [];

  let indexOccurrence = sourceStr.indexOf(searchStr, 0);

  while (indexOccurrence >= 0) {
    startingIndices.push(indexOccurrence);
    indexOccurrence = sourceStr.indexOf(searchStr, indexOccurrence + 1);
  }

  return startingIndices;
}
