import {
  CustomToastType,
  IToastProgressConfig,
  ToastsEnum
} from 'store/slices/toast/toastSlice.types';
import { getStore } from 'store/store';
import { getUnixTimestamp } from 'utils';

export const customToastComponentDictionary: Record<string, () => HTMLElement> =
  {};
export const customToastCloseHandlersDictionary: Record<string, () => void> =
  {};

export const addCustomToast = (
  customToast: CustomToastType,
  currentToastId?: string
) => {
  getStore().setState(
    ({ toasts: state }) => {
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

      const newToast: CustomToastType = {
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
    },
    false,
    'addCustomToast'
  );
};

export const removeCustomToast = (toastId: string) => {
  getStore().setState(
    ({ toasts: state }) => {
      state.customToasts = state.customToasts.filter(
        (toast) => toast.toastId !== toastId
      );
    },
    false,
    'removeCustomToast'
  );
};

export const removeAllCustomToasts = () => {
  getStore().setState(
    ({ toasts: state }) => {
      state.customToasts = [];
    },
    false,
    'removeAllCustomToasts'
  );
};

export const addTransactionToast = (toastId: string) => {
  getStore().setState(
    ({ toasts: state }) => {
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
    },
    false,
    'addTransactionToast'
  );
};

export const removeTransactionToast = (toastId: string) => {
  getStore().setState(
    ({ toasts: state }) => {
      state.transactionToasts = state.transactionToasts.filter((toast) => {
        return toast.toastId !== toastId;
      });
    },
    false,
    'removeTransactionToast'
  );

  delete customToastCloseHandlersDictionary[toastId];
  delete customToastComponentDictionary[toastId];
};

export const getToastProgressConfig = (
  toastId: string
): IToastProgressConfig | undefined => {
  const toastProgressConfig =
    getStore().getState().toasts.toastProgressConfig || {};
  return toastProgressConfig.hasOwnProperty(toastId)
    ? toastProgressConfig[toastId]
    : undefined;
};

export const updateToastProgressConfig = (
  toastId: string,
  progress: IToastProgressConfig
) => {
  getStore().setState(
    ({ toasts: state }) => {
      if (!state.toastProgressConfig) {
        state.toastProgressConfig = {};
      }
      state.toastProgressConfig[toastId] = progress;
    },
    false,
    'updateToastProgressConfig'
  );
};

export const deleteToastProgressConfig = (toastId: string) => {
  getStore().setState(
    ({ toasts: state }) => {
      if (state.toastProgressConfig?.hasOwnProperty(toastId)) {
        delete state.toastProgressConfig[toastId];
      }
    },
    false,
    'deleteToastProgressConfig'
  );
};

export const createCustomToast = (props: CustomToastType) => {
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

  if (props.instantiateToastElement) {
    customToastComponentDictionary[toastId] = props.instantiateToastElement;

    getStore().setState(
      ({ toasts: state }) => {
        const existingToastIndex = state.customToasts.findIndex(
          (toast) => toast.toastId === toastId
        );

        const toast: CustomToastType = {
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
      },
      false,
      'createCustomToast'
    );

    return toastId;
  }

  addCustomToast(props, toastId);
  return toastId;
};
