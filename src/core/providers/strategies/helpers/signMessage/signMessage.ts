import { Message } from '@multiversx/sdk-core/out';
import { PendingTransactionsEventsEnum } from 'core/managers/internal/PendingTransactionsStateManager/types/pendingTransactions.types';
import { SigningWarningsEnum } from 'types/enums.types';
import { getModalHandlers } from '../getModalHandlers';

type SignMessageWithModalPropsType<T> = {
  message: Message;
  handleSignMessage: (message: Message) => Promise<Message>;
  cancelAction?: () => Promise<T> | undefined;
  providerType: string;
};

export async function signMessage<T>({
  message,
  handleSignMessage,
  cancelAction,
  providerType
}: SignMessageWithModalPropsType<T>): Promise<Message> {
  const signedMsg = await new Promise<Awaited<Message>>(
    async (resolve, reject) => {
      const { eventBus, manager, onClose } = await getModalHandlers({
        cancelAction
      });

      const handleClose = async () => {
        await onClose(false);
        reject({ message: SigningWarningsEnum.cancelled });
      };

      eventBus.subscribe(PendingTransactionsEventsEnum.CLOSE, handleClose);

      manager.updateData({
        isPending: true,
        title: 'Message Signing',
        subtitle: `Check your ${providerType} to sign the message`
      });

      try {
        const signedMessage = await handleSignMessage(message);
        await onClose(false);
        resolve(signedMessage);
      } catch (err) {
        await onClose(false);
        reject(err);
      } finally {
        eventBus.unsubscribe(PendingTransactionsEventsEnum.CLOSE, handleClose);
      }
    }
  );
  return signedMsg;
}
