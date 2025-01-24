import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { LedgerConnectEventsEnum } from '../types';
import { getLedgerErrorCodes } from './getLedgerErrorCodes';
import { getLedgerProvider } from './getLedgerProvider';
import {
  LedgerEventBusType,
  LedgerConnectStateManagerType
} from '../types/ledgerProvider.types';

type InitializeLedgerProviderType = {
  eventBus?: LedgerEventBusType;
  manager?: LedgerConnectStateManagerType | null;
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
    eventBus?.unsubscribe(LedgerConnectEventsEnum.CLOSE, onCancel);

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
    eventBus?.subscribe(LedgerConnectEventsEnum.CLOSE, onCancel);
  }
};
