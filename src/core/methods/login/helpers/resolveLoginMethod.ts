import { ProviderTypeEnum } from 'core/ProviderFactory';
import { LoginMethodsEnum } from 'types/enums.types';

export function resolveLoginMethod(providerType: ProviderTypeEnum) {
  switch (providerType) {
    case ProviderTypeEnum.iframe:
      return LoginMethodsEnum.extra;
    case ProviderTypeEnum.extension:
      return LoginMethodsEnum.extension;
    case ProviderTypeEnum.crossWindow:
      return LoginMethodsEnum.crossWindow;
    case ProviderTypeEnum.hardware:
      return LoginMethodsEnum.ledger;
    case ProviderTypeEnum.metamask:
      return LoginMethodsEnum.metamask;
    case ProviderTypeEnum.walletConnect:
      return LoginMethodsEnum.walletconnectv2;
    case ProviderTypeEnum.wallet:
      return LoginMethodsEnum.wallet;
    case ProviderTypeEnum.opera:
      return LoginMethodsEnum.opera;
    default:
      return LoginMethodsEnum.none;
  }
}