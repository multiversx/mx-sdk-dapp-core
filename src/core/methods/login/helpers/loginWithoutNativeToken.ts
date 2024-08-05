import { setAddress } from 'store/actions/account';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { getCallbackUrl } from './loginWithNativeToken/getCallbackUrl';

export const loginWithoutNativeToken = async (provider: IProvider) => {
  await provider.login({
    callbackUrl: getCallbackUrl()
  });

  const address = provider.getAddress?.();

  if (!address) {
    throw new Error('Address not found');
  }

  setAddress(address);

  return {
    address
  };
};
