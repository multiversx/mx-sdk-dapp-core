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
    connect: () => {
      throw new Error('ledger connect UI not implemented');
    },
    sign: () => {
      throw new Error('ledger sign UI not implemented');
    }
  }
};

const defaultConfig = { UI };

export const getConfig = async (config: IProviderConfig = defaultConfig) => {
  if (!safeWindow.document) {
    return { ...defaultConfig, ...config };
  }

  const UI: IProviderConfigUI = {
    [ProviderTypeEnum.ledger]: {
      connect: async () => {
        defineCustomElements(safeWindow);
        const ledgerModalElement = document.createElement(
          'ledger-connect-modal'
        ) as LedgerConnectModal;

        document.body.appendChild(ledgerModalElement);

        const eventBus = await ledgerModalElement.getEventBus();
        return eventBus;
      },
      sign: async () => {
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
