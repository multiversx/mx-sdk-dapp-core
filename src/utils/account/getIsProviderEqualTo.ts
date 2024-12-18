import { getAccountProviderType } from './getAccountProviderType';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';

export function getIsProviderEqualTo(comparedProviderType: ProviderTypeEnum) {
  const providerType = getAccountProviderType();
  return providerType === comparedProviderType;
}
