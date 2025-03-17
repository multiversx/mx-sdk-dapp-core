import { WalletConnectStateManager } from 'core/managers/internal/WalletConnectStateManager/WalletConnectStateManager';
import { ProviderErrorsEnum } from 'types/provider.types';

export async function getWalletConnectHandlers<T>(props?: {
  cancelAction?: () => Promise<T> | undefined;
}) {
  const walletConnectManager = WalletConnectStateManager.getInstance();
  const eventBus = await walletConnectManager.getEventBus();

  if (!eventBus) {
    throw new Error(ProviderErrorsEnum.eventBusError);
  }

  const onClose = async (shouldCancelAction = true) => {
    walletConnectManager.closeAndReset();

    if (shouldCancelAction && props?.cancelAction) {
      await props.cancelAction();
    }
  };

  return { eventBus, manager: walletConnectManager, onClose };
}
