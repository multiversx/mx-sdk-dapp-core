import { getNetworkConfigFromApi } from 'apiCalls/configuration/getNetworkConfigFromApi';
import { getServerConfiguration } from 'apiCalls/configuration/getServerConfiguration';
import {
  DEVNET_CHAIN_ID,
  fallbackNetworkConfigurations,
  MAINNET_CHAIN_ID,
  TESTNET_CHAIN_ID
} from 'constants/network.constants';
import { emptyNetwork } from 'store/slices/network/emptyNetwork';
import { EnvironmentsEnum } from 'types/enums.types';
import { NetworkType, CustomNetworkType } from 'types/network.types';
import { initializeNetworkConfig } from './networkActions';

export type InitializeNetworkPropsType = {
  customNetworkConfig?: CustomNetworkType;
  environment?: EnvironmentsEnum;
};

export const initializeNetwork = async ({
  customNetworkConfig = {},
  environment
}: InitializeNetworkPropsType) => {
  const fetchConfigFromServer = !customNetworkConfig?.skipFetchFromServer;
  const customNetworkApiAddress = customNetworkConfig?.apiAddress;

  const isFoundEnv =
    environment && environment in fallbackNetworkConfigurations;

  const fallbackConfig: NetworkType | Record<string, string> = isFoundEnv
    ? fallbackNetworkConfigurations[environment as EnvironmentsEnum]
    : {};

  const baseConfig = {
    ...emptyNetwork,
    ...fallbackConfig,
    ...customNetworkConfig
  };

  const localConfig: NetworkType = {
    ...baseConfig,
    apiTimeout: String(baseConfig.apiTimeout)
  };

  const fallbackApiAddress = fallbackConfig?.apiAddress;

  if (!isFoundEnv && fetchConfigFromServer) {
    const apiAddress = customNetworkApiAddress || fallbackApiAddress;
    const dappConfig = await getServerConfiguration(apiAddress);

    const needsRoundDurationForPollingInterval =
      localConfig.chainId &&
      ![DEVNET_CHAIN_ID, TESTNET_CHAIN_ID, MAINNET_CHAIN_ID].includes(
        localConfig.chainId
      ) &&
      !localConfig.roundDuration;

    const shouldGetConfig =
      !localConfig.chainId || needsRoundDurationForPollingInterval;

    const networkConfig = shouldGetConfig
      ? await getNetworkConfigFromApi(apiAddress)
      : null;

    if (networkConfig != null) {
      localConfig.roundDuration = networkConfig.erd_round_duration;
    }

    if (dappConfig != null) {
      const apiConfig: NetworkType = {
        ...localConfig,
        ...dappConfig,
        ...customNetworkConfig
      };

      initializeNetworkConfig(apiConfig);
      return apiConfig;
    }
  }

  initializeNetworkConfig(localConfig);
  return localConfig;
};
