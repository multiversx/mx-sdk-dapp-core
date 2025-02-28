import { Message } from '@multiversx/sdk-core/out';
import { PendingTransactionsEventsEnum } from 'core/managers/internal/PendingTransactionsStateManager/types/pendingTransactions.types';
import { PendingTransactionsModal } from 'lib/sdkDappCoreUi';
import { SigningWarningsEnum } from 'types/enums.types';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement } from 'utils/createUIElement';
import { getModalHandlers } from '../getModalHandlers';

type SignMessagePropsType<T> = {
  message: Message;
  handleSignMessage: (message: Message) => Promise<Message>;
  cancelAction?: () => Promise<T> | undefined;
};

export async function signMessage<T>({
  message,
  handleSignMessage,
  cancelAction
}: SignMessagePropsType<T>): Promise<Message> {
  const msg = await new Promise<Awaited<Message>>(async (resolve, reject) => {
    if (!handleSignMessage) {
      return reject(ProviderErrorsEnum.notInitialized);
    }

    const modalElement = await createUIElement<PendingTransactionsModal>({
      name: 'pending-transactions-modal'
    });

    const { eventBus, manager, onClose } = await getModalHandlers({
      modalElement,
      cancelAction
    });

    const closeModal = () => {
      onClose();
      reject({ message: SigningWarningsEnum.cancelled });
    };

    eventBus.subscribe(PendingTransactionsEventsEnum.CLOSE, closeModal);

    manager.updateData({
      isPending: true,
      title: 'Message Signing',
      subtitle: 'Check your Ledger device to sign the message'
    });

    try {
      const signedMessage = await handleSignMessage(message);
      resolve(signedMessage);
    } catch (err) {
      reject(err);
    } finally {
      onClose();
      eventBus.unsubscribe(PendingTransactionsEventsEnum.CLOSE, closeModal);
    }
  });
  return msg;
}
