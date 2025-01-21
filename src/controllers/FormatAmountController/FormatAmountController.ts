import { stringIsFloat } from '@multiversx/sdk-dapp-utils/out/helpers/stringIsFloat';
import { stringIsInteger, ZERO } from 'lib/sdkDappUtils';
import { formatAmount } from 'utils/operations/formatAmount';
import { FormatAmountControllerPropsType, FormatedAmountType } from './types';

export class FormatAmountController {
  private formattedAmount: FormatedAmountType = {
    isValid: true,
    label: undefined,
    valueDecimal: ZERO,
    valueInteger: ZERO
  };

  constructor(private data: FormatAmountControllerPropsType) {
    this.formatAmount(this.data);
  }

  public formatAmount(data: FormatAmountControllerPropsType) {
    const formattedAmount = formatAmount(data);
    const isValid =
      stringIsInteger(data.input) && stringIsFloat(formattedAmount);
    const [valueInteger, valueDecimal] = formattedAmount.split('.');
    const label = ` ${data.token ?? data.egldLabel}`.trimEnd();

    this.formattedAmount = {
      isValid,
      label,
      valueDecimal,
      valueInteger
    };

    return this.getFormattedAmount();
  }

  public getFormattedAmount() {
    return this.formattedAmount;
  }
}
