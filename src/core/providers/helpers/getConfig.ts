import { safeWindow } from 'constants/index';
import { getEventBus } from './getEventBus';
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
  },
  [ProviderTypeEnum.walletConnect]: {
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
        const eventBus = await getEventBus('ledger-connect-modal');
        return eventBus;
      }
    },
    [ProviderTypeEnum.walletConnect]: {
      mount: async () => {
        const eventBus = await getEventBus('wallet-connect-modal');
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
