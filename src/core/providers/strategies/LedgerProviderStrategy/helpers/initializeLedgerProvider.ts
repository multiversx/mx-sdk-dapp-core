import { LedgerConnectStateManager } from 'core/managers/internal/LedgerConnectStateManager/LedgerConnectStateManager';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { getLedgerErrorCodes } from './getLedgerErrorCodes';
import { getLedgerProvider } from './getLedgerProvider';

type InitializeLedgerProviderType = {
  manager: LedgerConnectStateManager | null;
  resolve: (value: Awaited<ReturnType<typeof getLedgerProvider>>) => void;
  reject: (reason?: string) => void;
};

const failInitializeErrorText = 'Check if the MultiversX App is open on Ledger';

export const initializeLedgerProvider = async ({
  manager,
  resolve,
  reject
}: InitializeLedgerProviderType) => {
  const shouldInitiateLogin = !getIsLoggedIn();

  // Calls itself to handle retry logic if the user needs to reconnect to the Ledger provider.
  const onRetry = () => initializeLedgerProvider({ manager, resolve, reject });

  const onCancel = () => reject('Device unavailable');

  try {
    manager?.updateAccountScreen({
      isLoading: true
    });

    if (manager && shouldInitiateLogin) {
      manager.subscribeToProviderInit(onRetry, onCancel);
    }

    const data = await getLedgerProvider();

    if (manager && shouldInitiateLogin) {
      manager.unsubscribeFromProviderInit(onRetry, onCancel);
    }

    resolve(data);
  } catch (err) {
    if (!shouldInitiateLogin) {
      throw err;
    }

    const { errorMessage, defaultErrorMessage } = getLedgerErrorCodes(err);
    manager?.updateConnectScreen({
      error: errorMessage ?? defaultErrorMessage ?? failInitializeErrorText
    });

    if (manager) {
      manager.subscribeToProviderInit(onRetry, onCancel);
    }
  }
};
