import { SignTransactionsStateManager } from 'core/managers/internal/SignTransactionsStateManager/SignTransactionsStateManager';
import { ProviderErrorsEnum } from 'types/provider.types';

export async function getSignTransactionsHandlers<T>(props?: {
  cancelAction?: () => Promise<T> | undefined;
}) {
  const signTransactionsStateManager =
    SignTransactionsStateManager.getInstance();
  const eventBus = await signTransactionsStateManager.getEventBus();

  if (!eventBus) {
    throw new Error(ProviderErrorsEnum.eventBusError);
  }

  const onClose = async (shouldCancelAction = true) => {
    signTransactionsStateManager.closeAndReset();

    if (shouldCancelAction && props?.cancelAction) {
      await props.cancelAction();
    }
  };

  return { eventBus, manager: signTransactionsStateManager, onClose };
}
