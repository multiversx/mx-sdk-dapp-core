import {
  CANCEL_TRANSACTION_TOAST_DEFAULT_DURATION,
  CANCEL_TRANSACTION_TOAST_ID,
  ERROR_SIGNING_TOAST_ID
} from 'constants/transactions.constants';
import { ToastIconsEnum } from 'core/managers/internal/ToastManager/helpers/getToastDataStateByStatus';
import { createCustomToast } from 'store/actions';
import { SigningErrorsEnum, SigningWarningsEnum } from 'types/enums.types';

const states = {
  error: {
    title: SigningErrorsEnum.errorSigning.toString(),
    iconClassName: 'danger',
    toastId: `${ERROR_SIGNING_TOAST_ID}-${Date.now()}`
  },
  warning: {
    title: SigningWarningsEnum.cancelled.toString(),
    iconClassName: 'warning',
    toastId: `${CANCEL_TRANSACTION_TOAST_ID}-${Date.now()}`
  }
};

const errorsMap = {
  extensionResponse: 'Unable to sign transactions', // extension
  'Transaction canceled': 'Transaction canceled', // web wallet
  'cancelled by user': 'Transaction signing cancelled by user', // custom
  'denied by the user': 'Transaction signing denied by the user' // ledger
};

const getUserError = (error: string) => {
  for (const [key, value] of Object.entries(errorsMap)) {
    if (error.includes(key)) {
      return value;
    }
  }
  console.log('\x1b[42m%s\x1b[0m', 'errors', { error });

  return SigningErrorsEnum.errorSigning;
};

export function handleSignError(
  error: unknown,
  type: 'error' | 'warning' = 'error'
) {
  const originalError = (error as Error)?.message;
  const errorMessage = getUserError(originalError);

  console.log('\x1b[42m%s\x1b[0m', 'errors', { originalError, error, type });

  const state = Object.keys(states).includes(type)
    ? states[type]
    : states.error;

  const { toastId, iconClassName, title } = state;

  createCustomToast({
    toastId,
    duration: CANCEL_TRANSACTION_TOAST_DEFAULT_DURATION,
    icon: ToastIconsEnum.times,
    iconClassName,
    message: errorMessage,
    title
  });

  return errorMessage;
}
