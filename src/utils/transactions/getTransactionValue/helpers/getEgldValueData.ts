import { DECIMALS } from 'lib/sdkDappUtils';
import { formatAmount } from 'utils/operations/formatAmount';

export const getEgldValueData = (value: string) => ({
  egldValueData: {
    value,
    formattedValue: formatAmount({ input: value }),
    decimals: DECIMALS
  }
});
