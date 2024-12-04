import { Message, Address } from '@multiversx/sdk-core';
import { getAddress } from 'core/methods/account/getAddress';
import { getProviderType } from 'core/providers/helpers/utils';
import {
  IProvider,
  ProviderTypeEnum
} from 'core/providers/types/providerFactory.types';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { Nullable } from 'types';

export type SignMessageType = {
  provider: IProvider;
  message: Message;
  options?: {
    hasConsentPopup?: boolean;
  };
};

export async function signMessage({
  message,
  provider,
  options
}: SignMessageType): Promise<Nullable<Message>> {
  const address = getAddress();
  const providerType = getProviderType(provider);

  const messageToSign = new Message({
    address: new Address(address),
    data: message.data
  });

  if (
    options?.hasConsentPopup &&
    providerType === ProviderTypeEnum.crossWindow
  ) {
    (provider as unknown as CrossWindowProvider).setShouldShowConsentPopup(
      true
    );
  }

  const signedMessage = await provider.signMessage(messageToSign, options);

  return signedMessage;
}
