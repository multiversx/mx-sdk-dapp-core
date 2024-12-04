import { DIGITS, DECIMALS } from 'constants/index';
import { formatAmount, getUsdValue } from '../../operations';

export interface CalculateFeeInFiatParamsType {
  feeLimit: string;
  egldPriceInUsd: number;
  hideEqualSign?: boolean;
}

export function calculateFeeInFiat({
  feeLimit,
  egldPriceInUsd,
  hideEqualSign
}: CalculateFeeInFiatParamsType) {
  const amount = formatAmount({
    input: feeLimit,
    decimals: DECIMALS,
    digits: DIGITS,
    showLastNonZeroDecimal: true
  });

  const feeAsUsdValue = getUsdValue({
    amount,
    usd: egldPriceInUsd,
    decimals: DIGITS
  });

  if (hideEqualSign) {
    return feeAsUsdValue;
  }

  return `≈ ${feeAsUsdValue}`;
}
