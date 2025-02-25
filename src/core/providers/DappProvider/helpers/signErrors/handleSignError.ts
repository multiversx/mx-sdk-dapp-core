import {
  CANCEL_TRANSACTION_TOAST_DEFAULT_DURATION,
  CANCEL_TRANSACTION_TOAST_ID,
  ERROR_SIGNING_TOAST_ID
} from 'constants/transactions.constants';
import { createCustomToast } from 'store/actions';
import { SigningErrorsEnum, SigningWarningsEnum } from 'types/enums.types';

export function handleSignError(error?: unknown) {
  const originalError = (error as Error)?.message;
  const errorMessage = originalError || SigningErrorsEnum.errorSigning;
  const errorMessages = new Set<string>(Object.values(SigningErrorsEnum));
  const warningMessages = new Set(Object.values(SigningWarningsEnum));

  let displayError = SigningErrorsEnum.errorSigning.toString();
  let icon = 'times';
  let iconClassName = 'danger';
  let duration: number | undefined;
  let toastId = `${CANCEL_TRANSACTION_TOAST_ID}-${Date.now()}`;

  if (errorMessages.has(errorMessage)) {
    displayError = errorMessage;
    duration = CANCEL_TRANSACTION_TOAST_DEFAULT_DURATION;
  }
  if (warningMessages.has(errorMessage as SigningWarningsEnum)) {
    displayError = errorMessage;
    icon = 'warning';
    iconClassName = 'warning';
    toastId = ERROR_SIGNING_TOAST_ID;
  }

  createCustomToast({
    toastId,
    duration,
    icon,
    iconClassName,
    title: displayError,
    message: displayError != originalError ? originalError : ''
  });

  return errorMessage;
}
