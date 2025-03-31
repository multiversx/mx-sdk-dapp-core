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

export function handleSignError(
  error: unknown,
  type: 'error' | 'warning' = 'error'
) {
  const originalError = (error as Error)?.message;
  const errorMessage = originalError || SigningErrorsEnum.errorSigning;

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
