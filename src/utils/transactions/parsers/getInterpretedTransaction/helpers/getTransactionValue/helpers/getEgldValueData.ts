import { DECIMALS } from 'constants/index';
import { formatAmount } from 'utils';

export function getEgldValueData(value: string) {
  return {
    egldValueData: {
      value,
      formattedValue: formatAmount({ input: value }),
      decimals: DECIMALS
    }
  };
}
