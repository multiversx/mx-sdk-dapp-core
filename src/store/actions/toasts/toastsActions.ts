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
    const toastId =
      currentToastId || `custom-toast-${state.customToasts.length + 1}`;

    const existingToastIndex = state.customToasts.findIndex(
      (toast) => toast.toastId === toastId
    );

    if (existingToastIndex !== -1) {
      state.customToasts[existingToastIndex] = {
        ...state.customToasts[existingToastIndex],
        ...customToasts,
        type: ToastsEnum.custom,
        toastId
      } as CustomToastType;
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
    state.transactionToasts.push({
      type: ToastsEnum.transaction,
      startTimestamp: getUnixTimestamp(),
      toastId:
        toastId || `transaction-toast-${state.transactionToasts.length + 1}`
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
