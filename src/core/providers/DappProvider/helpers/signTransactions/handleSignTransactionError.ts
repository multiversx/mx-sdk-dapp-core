import {
  ERROR_SIGNING,
  TRANSACTION_CANCELLED
} from 'constants/errorMessages.constants';
import {
  CANCEL_TRANSACTION_TOAST_DEFAULT_DURATION,
  CANCEL_TRANSACTION_TOAST_ID
} from 'constants/transactions.constants';
import { createCustomToast } from 'store/actions';

export function handleSignTransactionError(error?: unknown) {
  const errorMessage = (error as Error)?.message || ERROR_SIGNING;
  const isTxCancelled = errorMessage.includes(TRANSACTION_CANCELLED);
  if (isTxCancelled) {
    createCustomToast({
      toastId: `${CANCEL_TRANSACTION_TOAST_ID}-${Date.now()}`,
      duration: CANCEL_TRANSACTION_TOAST_DEFAULT_DURATION,
      icon: 'warning',
      iconClassName: 'warning',
      message: TRANSACTION_CANCELLED
    });
  }

  return errorMessage;
}
