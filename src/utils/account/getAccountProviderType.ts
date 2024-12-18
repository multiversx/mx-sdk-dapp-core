import { getAccountProvider } from 'core/providers';
import { getProviderType } from 'core/providers/helpers/getProviderType';

export function getAccountProviderType() {
  const provider = getAccountProvider();
  return getProviderType(provider);
}
