import { PendingTransactionsStateManager } from 'core/managers/internal/PendingTransactionsStateManager/PendingTransactionsStateManager';
import { PendingTransactionsModal } from 'lib/sdkDappCoreUi';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement } from 'utils/createUIElement';

export async function getModalHandlers<T>(props?: {
  cancelAction?: () => Promise<T> | undefined;
}) {
  const modalElement = await createUIElement<PendingTransactionsModal>({
    name: 'pending-transactions-modal'
  });

  const eventBus = await modalElement.getEventBus();

  if (!eventBus) {
    throw new Error(ProviderErrorsEnum.eventBusError);
  }

  const manager = new PendingTransactionsStateManager(eventBus);

  const onClose = async (shouldCancelAction = true) => {
    if (shouldCancelAction) {
      await props?.cancelAction?.();
    }

    manager.closeAndReset();
  };
  return { eventBus, manager, onClose };
}
