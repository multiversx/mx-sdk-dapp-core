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
    const serverConfig = await getServerConfiguration(
      customNetworkApiAddress || fallbackApiAddress
    );

    if (serverConfig != null) {
      const apiConfig: NetworkType = {
        ...fallbackConfig,
        ...serverConfig,
        ...customNetworkConfig
      };

      initializeNetworkConfig(apiConfig);
      return apiConfig;
    }
  }

  initializeNetworkConfig(localConfig);
  return localConfig;
};
