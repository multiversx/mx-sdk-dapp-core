import { getServerConfiguration } from 'apiCalls/configuration/getServerConfiguration';
import { EnvironmentsEnum } from 'types/enums.types';
import { CustomNetworkType, NetworkType } from 'types/network.types';
import { initializeNetworkConfig } from './networkActions';
import { fallbackNetworkConfigurations } from 'constants/network.constants';

export type InitializeNetworkParamsType = {
  customNetworkConfig?: CustomNetworkType;
  environment: EnvironmentsEnum;
};

export const initializeNetwork = async ({
  customNetworkConfig = {},
  environment
}: InitializeNetworkParamsType): Promise<NetworkType> => {
  const fetchConfigFromServer = !customNetworkConfig?.skipFetchFromServer;
  const customNetworkApiAddress = customNetworkConfig?.apiAddress;
  const fallbackConfig = fallbackNetworkConfigurations[environment] || {};

  const localConfig = {
    ...fallbackConfig,
    ...customNetworkConfig
  };

  if (fetchConfigFromServer) {
    const fallbackApiAddress = fallbackConfig?.apiAddress;

    const serverConfig = await getServerConfiguration(
      customNetworkApiAddress || fallbackApiAddress
    );

    if (serverConfig != null) {
      const apiConfig = {
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
