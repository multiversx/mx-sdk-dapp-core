import {
  EXTRA_GAS_LIMIT_GUARDED_TX,
  GAS_LIMIT,
  GAS_PER_DATA_BYTE
} from 'constants/index';
import BigNumber from 'bignumber.js';

export function calculateGasLimit({
  data,
  isGuarded
}: {
  data?: string;
  isGuarded?: boolean;
}) {
  const guardedAccountGasLimit = isGuarded ? EXTRA_GAS_LIMIT_GUARDED_TX : 0;
  const bNconfigGasLimit = new BigNumber(GAS_LIMIT).plus(
    guardedAccountGasLimit
  );
  const bNgasPerDataByte = new BigNumber(GAS_PER_DATA_BYTE);
  const bNgasValue = data
    ? bNgasPerDataByte.times(Buffer.from(data).length)
    : 0;
  const bNgasLimit = bNconfigGasLimit.plus(bNgasValue);
  const gasLimit = bNgasLimit.toString(10);
  return gasLimit;
}
