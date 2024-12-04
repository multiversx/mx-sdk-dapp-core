// TODO: Move to utils
import { DECIMALS } from 'constants/index';

export function maxDecimals(amount: string, decimals = DECIMALS) {
  if (
    amount != null &&
    amount.toString().indexOf('.') >= 0 &&
    (amount as any).toString().split('.').pop().length > decimals
  ) {
    return false;
  }
  return true;
}
