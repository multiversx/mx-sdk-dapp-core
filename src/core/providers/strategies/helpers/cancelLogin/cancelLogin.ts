export const cancelLogin = (params: {
  loginAbortController: AbortController | null;
  resetLoginAbortController: () => void;
  onAfterCancel?: () => void;
}) => {
  let { loginAbortController, onAfterCancel, resetLoginAbortController } =
    params;

  if (loginAbortController) {
    loginAbortController.abort();
  }

  onAfterCancel?.();
  resetLoginAbortController();
};
