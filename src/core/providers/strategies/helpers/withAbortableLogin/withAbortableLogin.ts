type WithAbortableLoginParams<T> = {
  loginAbortController: AbortController | null;
  setLoginAbortController: (controller: AbortController | null) => void;
  loginOperation: () => Promise<T>;
};

export async function withAbortableLogin<T>({
  loginAbortController,
  setLoginAbortController,
  loginOperation
}: WithAbortableLoginParams<T>): Promise<T> {
  if (loginAbortController) {
    loginAbortController.abort();
  }

  const controller = new AbortController();
  setLoginAbortController(controller);

  const signal = controller.signal;

  try {
    const abortPromise = new Promise<never>((_, reject) => {
      signal.addEventListener('abort', () => {
        reject(new Error('Login cancelled'));
      });
    });

    const result = await Promise.race([loginOperation(), abortPromise]);

    setLoginAbortController(null);

    return result;
  } catch (error) {
    setLoginAbortController(null);
    throw error;
  }
}
