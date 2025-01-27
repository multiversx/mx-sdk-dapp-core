import { ERROR_SIGNING } from 'constants/errorMessages.constants';
import {
  CANCEL_TRANSACTION_TOAST_DEFAULT_DURATION,
  CANCEL_TRANSACTION_TOAST_ID
} from 'constants/transactions.constants';
import { createCustomToast } from 'store/actions';

export function handleSignMessageError(error?: unknown) {
  const errorMessage =
    (error as Error)?.message || (error as string) || ERROR_SIGNING;
  console.error(errorMessage);

  createCustomToast({
    toastId: `${CANCEL_TRANSACTION_TOAST_ID}-${Date.now()}`,
    duration: CANCEL_TRANSACTION_TOAST_DEFAULT_DURATION,
    icon: 'warning',
    iconClassName: 'warning',
    message: ERROR_SIGNING
  });

  return errorMessage;
}
