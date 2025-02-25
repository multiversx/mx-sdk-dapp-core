import { getNetworkConfigFromApi } from 'apiCalls/configuration/getNetworkConfigFromApi';
import { getServerConfiguration } from 'apiCalls/configuration/getServerConfiguration';
import { fallbackNetworkConfigurations } from 'constants/network.constants';
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

  if (fetchConfigFromServer) {
    const apiAddress = customNetworkApiAddress || fallbackApiAddress;
    const [dappConfig, networkConfig] = await Promise.all([
      getServerConfiguration(apiAddress),
      getNetworkConfigFromApi(apiAddress)
    ]);

    if (dappConfig != null) {
      const apiConfig: NetworkType = {
        ...fallbackConfig,
        ...dappConfig,
        ...customNetworkConfig
      };

      if (networkConfig != null) {
        apiConfig.roundDuration = networkConfig.erd_round_duration;
      }

      initializeNetworkConfig(apiConfig);
      return apiConfig;
    }
  }

  initializeNetworkConfig(localConfig);
  return localConfig;
};
