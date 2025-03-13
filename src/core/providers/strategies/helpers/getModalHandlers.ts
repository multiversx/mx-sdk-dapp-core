import { UITagsEnum } from 'constants/UITags.enum';
import { PendingTransactionsStateManager } from 'core/managers/internal/PendingTransactionsStateManager/PendingTransactionsStateManager';
import { PendingTransactionsPanel } from 'lib/sdkDappCoreUi';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement } from 'utils/createUIElement';

export async function getModalHandlers<T>(props?: {
  cancelAction?: () => Promise<T> | undefined;
}) {
  const modalElement = await createUIElement<PendingTransactionsPanel>({
    name: UITagsEnum.PENDING_TRANSACTIONS_PANEL
  });

  const eventBus = await modalElement.getEventBus();

  if (!eventBus) {
    throw new Error(ProviderErrorsEnum.eventBusError);
  }

  const manager = new PendingTransactionsStateManager(eventBus);

  const onClose = async (shouldCancelAction = true) => {
    manager.closeAndReset();

    if (shouldCancelAction && props?.cancelAction) {
      await props.cancelAction();
    }
  };
  return { eventBus, manager, onClose };
}
