import {
  CANCEL_TRANSACTION_TOAST_DEFAULT_DURATION,
  CANCEL_TRANSACTION_TOAST_ID,
  ERROR_SIGNING_TOAST_ID
} from 'constants/transactions.constants';
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

export function handleSignError(error: {
  message: string;
  name: 'error' | 'warning';
}) {
  const originalError = (error as Error)?.message;
  const errorMessage = originalError || SigningErrorsEnum.errorSigning;

  const state = Object.keys(states).includes(error.name)
    ? states[error.name]
    : states.error;

  const { toastId, iconClassName, title } = state;

  createCustomToast({
    toastId,
    duration: CANCEL_TRANSACTION_TOAST_DEFAULT_DURATION,
    icon: 'times',
    iconClassName,
    message: title
  });

  return errorMessage;
}
