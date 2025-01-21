import { stringIsInteger, stringIsFloat } from 'lib/sdkDappUtils';
import { formatAmount } from 'utils/operations/formatAmount';
import { FormatAmountControllerPropsType, FormatedAmountType } from './types';

export class FormatAmountController {
  public static getData(props: FormatAmountControllerPropsType) {
    const formattedAmount = formatAmount(props);
    const isValid =
      stringIsInteger(props.input) && stringIsFloat(formattedAmount);

    const [valueInteger, valueDecimal] = formattedAmount.split('.');
    const label = ` ${props.token ?? props.egldLabel}`.trimEnd();

    return {
      isValid,
      label,
      valueDecimal,
      valueInteger
    }
  }
}
