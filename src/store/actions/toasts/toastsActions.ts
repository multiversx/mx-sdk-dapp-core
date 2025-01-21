import {
  CustomToastType,
  ToastsEnum
} from 'store/slices/toast/toastSlice.types';
import { getStore } from 'store/store';
import { getUnixTimestamp } from 'utils';

export const addCustomToast = (
  customToasts: CustomToastType,
  currentToastId?: string
) => {
  getStore().setState(({ toasts: state }) => {
    const lastToastIndex =
      state.customToasts.length > 0
        ? Math.max(
            ...state.customToasts.map((toast) =>
              parseInt(toast.toastId.split('-').pop() || '0')
            )
          )
        : 0;
    const toastId = currentToastId || `custom-toast-${lastToastIndex + 1}`;

    const existingToastIndex = state.customToasts.findIndex(
      (toast) => toast.toastId === toastId
    );

    const isToastFound = existingToastIndex !== -1;

    if (isToastFound) {
      const updatedToast: CustomToastType = {
        ...state.customToasts[existingToastIndex],
        ...customToasts,
        type: ToastsEnum.custom,
        toastId
      };

      state.customToasts[existingToastIndex] = updatedToast;
      return;
    }

    state.customToasts.push({
      ...customToasts,
      type: ToastsEnum.custom,
      toastId
    });
  });
};

export const removeCustomToast = (toastId: string) => {
  getStore().setState(({ toasts: state }) => {
    state.customToasts = state.customToasts.filter(
      (toast) => toast.toastId !== toastId
    );
  });
};

export const addTransactionToast = (toastId: string) => {
  getStore().setState(({ toasts: state }) => {
    const lastToastIndex =
      state.transactionToasts.length > 0
        ? Math.max(
            ...state.transactionToasts.map((toast) =>
              parseInt(toast.toastId.split('-').pop() || '0')
            )
          )
        : 0;
    const newToastId = toastId || `transaction-toast-${lastToastIndex + 1}`;

    state.transactionToasts.push({
      type: ToastsEnum.transaction,
      startTimestamp: getUnixTimestamp(),
      toastId: newToastId
    });
  });
};

export const removeTransactionToast = (toastId: string) => {
  getStore().setState(({ toasts: state }) => {
    state.transactionToasts = state.transactionToasts.filter((toast) => {
      return toast.toastId !== toastId;
    });
  });
};

export const getToastProgress = (toastId: string): number | undefined => {
  const toastProgress = getStore().getState().toasts.toastProgress || {};
  return toastProgress.hasOwnProperty(toastId)
    ? toastProgress[toastId]
    : undefined;
};

export const updateToastProgress = (toastId: string, progress: number) => {
  getStore().setState(({ toasts: state }) => {
    if (!state.toastProgress) {
      state.toastProgress = {};
    }
    state.toastProgress[toastId] = progress;
  });
};

export const deleteToastProgress = (toastId: string) => {
  getStore().setState(({ toasts: state }) => {
    if (state.toastProgress?.hasOwnProperty(toastId)) {
      delete state.toastProgress[toastId];
    }
  });
};
