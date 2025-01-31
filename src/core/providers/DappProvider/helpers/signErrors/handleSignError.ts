import { ERROR_SIGNING } from 'constants/errorMessages.constants';
import {
  CANCEL_TRANSACTION_TOAST_DEFAULT_DURATION,
  CANCEL_TRANSACTION_TOAST_ID,
  ERROR_SIGNING_TOAST_ID
} from 'constants/transactions.constants';
import { createCustomToast } from 'store/actions';
import { SigningErrorsEnum, SigningWarningsEnum } from 'types';

export function handleSignError(error?: unknown) {
  const errorMessage = (error as Error)?.message || ERROR_SIGNING;
  const errorMessages = new Set(Object.values(SigningErrorsEnum));
  const warningMessages = new Set(Object.values(SigningWarningsEnum));

  let displayError = ERROR_SIGNING;
  let icon = 'times';
  let iconClassName = 'danger';
  let duration: number | undefined;
  let toastId = `${CANCEL_TRANSACTION_TOAST_ID}-${Date.now()}`;

  if (errorMessages.has(errorMessage as SigningErrorsEnum)) {
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
    message: displayError
  });

  return errorMessage;
}
