import { IframeProvider } from '@multiversx/sdk-web-wallet-iframe-provider/out';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { ProviderTypeEnum } from '../types/providerFactory.types';

export const clearInitiatedLogins = (props?: {
  skipLoginMethod: ProviderTypeEnum;
}) => {
  Object.values(ProviderTypeEnum).forEach((method) => {
    if (method === props?.skipLoginMethod) {
      return;
    }

    switch (method) {
      case ProviderTypeEnum.crossWindow: {
        const crossWindowProvider = CrossWindowProvider.getInstance();
        if (crossWindowProvider.isInitialized()) {
          crossWindowProvider.dispose();
        }
        break;
      }

      case ProviderTypeEnum.metamask: {
        const iframeProvider = IframeProvider.getInstance();
        if (iframeProvider.isInitialized()) {
          iframeProvider.dispose();
        }
        break;
      }
      default:
        break;
    }
  });

  return null;
};
