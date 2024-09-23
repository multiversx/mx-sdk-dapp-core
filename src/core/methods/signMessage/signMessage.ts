import { Message, Address } from '@multiversx/sdk-core';
import { getAccountProvider } from 'core/providers';
import { getProviderType } from 'core/providers/helpers/utils';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { Nullable } from 'types';
import { getAddress } from '../account/getAddress';
import { addOriginToLocationPath } from 'utils/window/addOriginToLocationPath';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';

export interface SignMessageType {
  message: Message;
  callbackRoute?: string;
  options?: {
    hasConsentPopup?: boolean;
  };
}

export const signMessage = async ({
  message,
  options
}: SignMessageType): Promise<Nullable<Message>> => {
  const address = getAddress();
  const provider = getAccountProvider();
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

  // TODO upgrade sdk-dapp-utils to use Message as input for signMessage method and remove the cast
  const signedMessage = await provider.signMessage(messageToSign, options);

  // TODO upgrade sdk-dapp-utils to return Message instead of SignableMessage and remove the cast
  return signedMessage as Nullable<Message>;
};
