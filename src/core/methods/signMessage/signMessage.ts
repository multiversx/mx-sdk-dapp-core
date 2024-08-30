import { SignableMessage, Address } from '@multiversx/sdk-core';
import { getAccountProvider } from 'core/providers';
import { getProviderType } from 'core/providers/helpers/utils';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { LoginMethodsEnum, Nullable } from 'types';
import { getAddress } from '../account/getAddress';

export interface SignMessageType {
  message: string;
  callbackRoute?: string;
  options?: {
    hasConsentPopup?: boolean;
  };
}

export const signMessage = async ({
  message,
  callbackRoute,
  options
}: SignMessageType): Promise<Nullable<SignableMessage>> => {
  const address = getAddress();
  const provider = getAccountProvider();
  const providerType = getProviderType(provider);

  const callbackUrl = addOriginToLocationPath(callbackRoute);
  const signableMessage = new SignableMessage({
    address: new Address(address),
    message: Buffer.from(message, 'ascii')
  });

  if (
    options?.hasConsentPopup &&
    providerType === LoginMethodsEnum.crossWindow
  ) {
    (provider as unknown as CrossWindowProvider).setShouldShowConsentPopup(
      true
    );
  }

  const signedMessage = await provider.signMessage(signableMessage, {
    callbackUrl: encodeURIComponent(callbackUrl)
  });

  return signedMessage;
};
