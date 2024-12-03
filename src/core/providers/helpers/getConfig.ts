import type { LedgerConnectModal } from '@multiversx/sdk-dapp-core-ui/dist/components/ledger-connect-modal';
import { defineCustomElements } from '@multiversx/sdk-dapp-core-ui/loader';
import {
  IProviderConfig,
  ProviderTypeEnum
} from '../types/providerFactory.types';

export const getConfig = async (config: IProviderConfig = {}) => {
  defineCustomElements(window);
  const ledgerModalElement = document.createElement(
    'ledger-connect-modal'
  ) as LedgerConnectModal;
  document.body.appendChild(ledgerModalElement);
  await customElements.whenDefined('ledger-connect-modal');
  const eventBus = await ledgerModalElement.getEventBus();

  const ui = {
    [ProviderTypeEnum.ledger]: {
      eventBus,
      mount: () => {
        document.body.appendChild(ledgerModalElement);
      }
    }
  };

  return {
    ...config,
    ui: {
      ...ui,
      ...config.ui
    }
  };
};
