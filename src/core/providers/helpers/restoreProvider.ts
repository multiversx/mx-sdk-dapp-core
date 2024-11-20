import { providerTypeSelector } from 'store/selectors';
import { ProviderFactory } from '../ProviderFactory';
import { IProviderConfig } from '../types/providerFactory.types';
import { getState } from 'store/store';
import { setAccountProvider } from '../accountProvider';
import { getAddress } from 'core/methods/account/getAddress';

export async function restoreProvider() {
  const type = providerTypeSelector(getState());
  const address = getAddress();

  if (!type) {
    return;
  }

  const config: IProviderConfig = {
    account: {
      address
    }
  };

  const factory = new ProviderFactory();

  const provider = await factory.create({
    type,
    config
  });

  if (!provider) {
    throw new Error('Provider not found');
  }

  setAccountProvider(provider);
}
