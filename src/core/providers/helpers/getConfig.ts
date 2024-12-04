import type { LedgerConnectModal } from '@multiversx/sdk-dapp-core-ui/dist/components/ledger-connect-modal';
import { defineCustomElements } from '@multiversx/sdk-dapp-core-ui/loader';
import { safeWindow } from 'constants/index';
import {
  IEventBus,
  IProviderConfig,
  IProviderConfigUI,
  ProviderTypeEnum
} from '../types/providerFactory.types';

const UI: IProviderConfigUI = {
  [ProviderTypeEnum.ledger]: {
    eventBus: {} as IEventBus,
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

  defineCustomElements(safeWindow);
  const ledgerModalElement = document.createElement(
    'ledger-connect-modal'
  ) as LedgerConnectModal;
  document.body.appendChild(ledgerModalElement);
  await customElements.whenDefined('ledger-connect-modal');
  const eventBus = await ledgerModalElement.getEventBus();

  const UI = {
    [ProviderTypeEnum.ledger]: {
      eventBus,
      mount: () => {
        document.body.appendChild(ledgerModalElement);
      }
    }
  };

  return {
    ...config,
    UI: {
      ...UI,
      ...config.UI
    }
  };
};
