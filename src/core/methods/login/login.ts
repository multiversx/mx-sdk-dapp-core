import { setProviderType } from 'store/actions/loginInfo/loginInfoActions';
import { setAccountProvider } from 'core/providers/accountProvider';
import { IProviderFactory } from 'core/providers/types/providerFactory.types';
import { ProviderFactory } from 'core/providers/ProviderFactory';
import { nativeAuthConfigSelector } from 'store/selectors';
import { getState } from 'store/store';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { getAddress } from 'core/methods/account/getAddress';
import { SECOND_LOGIN_ATTEMPT_ERROR } from 'constants/errorMessages.constants';
import { loginWithNativeToken } from './helpers/loginWithNativeToken/loginWithNativeToken';
import { loginWithoutNativeToken } from './helpers/loginWithoutNativeToken';

export const login = async ({
  providerConfig
}: {
  providerConfig: IProviderFactory;
}) => {
  const loggedIn = getIsLoggedIn();

  if (loggedIn) {
    console.warn('Already logged in with:', getAddress());
    throw new Error(SECOND_LOGIN_ATTEMPT_ERROR);
  }

  const factory = new ProviderFactory();
  const provider = await factory.create(providerConfig);

  if (!provider) {
    throw new Error('Provider not found');
  }

  await provider.init?.();
  setAccountProvider(provider);
  setProviderType(providerConfig.type);

  const nativeAuthConfig = nativeAuthConfigSelector(getState());

  if (nativeAuthConfig) {
    return await loginWithNativeToken(provider, nativeAuthConfig);
  }

  return await loginWithoutNativeToken(provider);
};
