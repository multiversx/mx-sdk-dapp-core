import type { LedgerConnectModal } from '@multiversx/sdk-dapp-core-ui/dist/components/ledger-connect-modal';
import { defineCustomElements } from '@multiversx/sdk-dapp-core-ui/loader';
import { safeWindow } from 'constants/index';
import {
  IProviderConfig,
  IProviderConfigUI,
  ProviderTypeEnum
} from '../types/providerFactory.types';

const UI: IProviderConfigUI = {
  [ProviderTypeEnum.ledger]: {
    mount: () => {
      throw new Error('mount not implemented');
    }
  }
};

const defaultConfig = { UI };

export const getConfig = async (config: IProviderConfig = defaultConfig) => {
  if (!safeWindow.document) {
    return { ...defaultConfig, ...config };
  }

  const UI = {
    [ProviderTypeEnum.ledger]: {
      mount: async () => {
        defineCustomElements(safeWindow);
        const ledgerModalElement = document.createElement(
          'ledger-connect-modal'
        ) as LedgerConnectModal;

        document.body.appendChild(ledgerModalElement);

        const eventBus = await ledgerModalElement.getEventBus();
        return eventBus;
      }
    }
  };

  return {
    ...config,
    UI: {
      ...defaultConfig.UI,
      ...UI
    }
  };
};
