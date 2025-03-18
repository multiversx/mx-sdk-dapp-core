import { LedgerConnectStateManager } from 'core/managers/internal/LedgerConnectStateManager/LedgerConnectStateManager';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { LedgerConnectEventsEnum, IEventBus } from 'lib/sdkDappCoreUi';
import { getLedgerErrorCodes } from './getLedgerErrorCodes';
import { getLedgerProvider } from './getLedgerProvider';

type InitializeLedgerProviderType = {
  eventBus: IEventBus | null;
  manager: LedgerConnectStateManager | null;
  resolve: (value: Awaited<ReturnType<typeof getLedgerProvider>>) => void;
  reject: (reason?: string) => void;
};

const failInitializeErrorText = 'Check if the MultiversX App is open on Ledger';

export const initializeLedgerProvider = async ({
  eventBus,
  manager,
  resolve,
  reject
}: InitializeLedgerProviderType) => {
  const shouldInitiateLogin = !getIsLoggedIn();

  // Calls itself to handle retry logic if the user needs to reconnect to the Ledger provider.
  const onRetry = () =>
    initializeLedgerProvider({ eventBus, manager, resolve, reject });

  const onCancel = () => reject('Device unavailable');

  try {
    manager?.updateAccountScreen({
      isLoading: true
    });

    const data = await getLedgerProvider();

    eventBus?.unsubscribe(LedgerConnectEventsEnum.CONNECT_DEVICE, onRetry);
    eventBus?.unsubscribe(
      LedgerConnectEventsEnum.CLOSE_LEDGER_CONNECT_PANEL,
      onCancel
    );

    resolve(data);
  } catch (err) {
    if (!shouldInitiateLogin) {
      throw err;
    }

    const { errorMessage, defaultErrorMessage } = getLedgerErrorCodes(err);
    manager?.updateConnectScreen({
      error: errorMessage ?? defaultErrorMessage ?? failInitializeErrorText
    });

    eventBus?.subscribe(LedgerConnectEventsEnum.CONNECT_DEVICE, onRetry);
    eventBus?.subscribe(
      LedgerConnectEventsEnum.CLOSE_LEDGER_CONNECT_PANEL,
      onCancel
    );
  }
};
