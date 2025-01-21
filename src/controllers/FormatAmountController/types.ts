import { FormatAmountPropsType } from 'utils/operations/formatAmount';

export interface FormatAmountControllerPropsType extends FormatAmountPropsType {
  egldLabel?: string;
  token?: string;
}

export interface FormatedAmountType {
  isValid: boolean;
  label?: string;
  valueDecimal: string;
  valueInteger: string;
}
