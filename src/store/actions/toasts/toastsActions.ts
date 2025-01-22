import {
  ICustomToastType,
  ToastsEnum
} from 'store/slices/toast/toastSlice.types';
import { getStore } from 'store/store';
import { getUnixTimestamp } from 'utils';

export const customToastComponentDictionary: Record<string, () => HTMLElement> =
  {};
export const customToastCloseHandlersDictionary: Record<string, () => void> =
  {};

export const addCustomToast = (
  customToast: ICustomToastType,
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

    const newToast: ICustomToastType = {
      ...customToast,
      type: ToastsEnum.custom,
      toastId
    };

    const isToastFound = existingToastIndex !== -1;

    if (isToastFound) {
      state.customToasts[existingToastIndex] = newToast;
      return;
    }

    state.customToasts.push({
      ...newToast,
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

export const removeAllCustomToast = () => {
  getStore().setState(({ toasts: state }) => {
    state.customToasts = [];
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

  if (customToastCloseHandlersDictionary[toastId]) {
    delete customToastCloseHandlersDictionary[toastId];
  }

  if (customToastComponentDictionary[toastId]) {
    delete customToastComponentDictionary[toastId];
  }
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

export const createCustomToast = (props: ICustomToastType) => {
  const { toasts } = getStore().getState();

  const lastToastIndex =
    toasts.customToasts.length > 0
      ? Math.max(
          ...toasts.customToasts.map((toast) =>
            parseInt(toast.toastId.split('-').pop() || '0')
          )
        )
      : 0;

  const toastId = props.toastId || `custom-toast-${lastToastIndex + 1}`;

  if (props.onClose) {
    customToastCloseHandlersDictionary[toastId] = props.onClose;
  }

  if (props.instantiateToastElement && props.instantiateToastElement != null) {
    customToastComponentDictionary[toastId] = props.instantiateToastElement;

    getStore().setState(({ toasts: state }) => {
      const existingToastIndex = state.customToasts.findIndex(
        (toast) => toast.toastId === toastId
      );

      const toast: ICustomToastType = {
        ...props,
        instantiateToastElement: null,
        type: ToastsEnum.custom,
        toastId
      };

      const isToastFound = existingToastIndex !== -1;

      if (isToastFound) {
        state.customToasts[existingToastIndex] = toast;
      } else {
        state.customToasts.push(toast);
      }
    });

    return toastId;
  }

  addCustomToast(props, toastId);
  return toastId;
};
