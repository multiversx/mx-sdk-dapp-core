import { PendingTransactionsStateManager } from 'core/managers/internal/PendingTransactionsStateManager/PendingTransactionsStateManager';
import { PendingTransactionsModal } from 'lib/sdkDappCoreUi';
import { ProviderErrorsEnum } from 'types/provider.types';

export async function getModalHandlers<T>({
  modalElement,
  cancelAction
}: {
  modalElement: PendingTransactionsModal;
  cancelAction?: () => Promise<T> | undefined;
}) {
  const eventBus = await modalElement.getEventBus();

  if (!eventBus) {
    throw new Error(ProviderErrorsEnum.eventBusError);
  }

  const manager = new PendingTransactionsStateManager(eventBus);

  const onClose = async (shouldCancelAction = true) => {
    if (shouldCancelAction) {
      await cancelAction?.();
    }

    manager.closeAndReset();
  };
  return { eventBus, manager, onClose };
}
