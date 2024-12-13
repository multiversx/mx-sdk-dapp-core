import { getAddress } from 'core/methods/account/getAddress';
import {
  walletConnectConfigSelector,
  providerTypeSelector
} from 'store/selectors';
import { getState } from 'store/store';
import { setAccountProvider } from '../accountProvider';
import { ProviderFactory } from '../ProviderFactory';
import { IProviderConfig } from '../types/providerFactory.types';

export async function restoreProvider() {
  const type = providerTypeSelector(getState());
  const walletConnectConfig = walletConnectConfigSelector(getState());

  const address = getAddress();

  if (!type) {
    return;
  }

  const config: IProviderConfig = {
    account: {
      address
    }
  };

  if (walletConnectConfig) {
    config.walletConnect = walletConnectConfig;
  }

  const provider = await ProviderFactory.create({
    type,
    config
  });

  if (!provider) {
    throw new Error('Provider not found');
  }

  setAccountProvider(provider);
}
