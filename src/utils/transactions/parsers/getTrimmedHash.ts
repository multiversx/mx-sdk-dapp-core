export function getTrimmedHash(address: string, divider = 4): string {
  return `${address.substring(
    0,
    Math.floor(address.length / divider)
  )}...${address.substring(
    address.length - Math.ceil(address.length / divider)
  )}`;
}
