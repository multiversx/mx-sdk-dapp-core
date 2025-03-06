import { Message } from '@multiversx/sdk-core/out';
import { providerLabels } from 'core/providers/types/providerFactory.types';
import { getLedgerErrorCodes } from './getLedgerErrorCodes';
import { signMessage } from '../../helpers/signMessage/signMessage';

export async function signLedgerMessage({
  message,
  handleSignMessage
}: {
  message: Message;
  handleSignMessage: (message: Message) => Promise<Message>;
}): Promise<Message> {
  try {
    const signedMessage = await signMessage({
      message,
      handleSignMessage: handleSignMessage,
      providerType: providerLabels.ledger
    });
    return signedMessage;
  } catch (error) {
    const { errorMessage: message } = getLedgerErrorCodes(error);
    throw message ? { message } : error;
  }
}
