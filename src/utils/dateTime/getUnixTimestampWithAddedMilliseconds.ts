// TODO: Move to utils
export function getUnixTimestampWithAddedMilliseconds(
  addedMilliseconds: number
) {
  return (
    new Date().setMilliseconds(
      new Date().getMilliseconds() + addedMilliseconds
    ) / 1000
  );
}
