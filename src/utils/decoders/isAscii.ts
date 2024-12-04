// TODO: Move to utils
export function isAscii(str: string) {
  // eslint-disable-next-line no-control-regex
  return !/[^\x00-\x7F]/gm.test(str);
}
