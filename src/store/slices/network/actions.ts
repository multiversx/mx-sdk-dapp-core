import { getServerConfiguration } from 'apiCalls/configuration/getServerConfiguration';
import { fallbackNetworkConfigurations } from 'constants/network';
import { EnvironmentsEnum } from 'types/enums.types';
import { CustomNetworkType } from 'types/network.types';
import { networkStore } from './network';

export type InitializeNetworkPropsType = {
  customNetworkConfig?: CustomNetworkType;
  environment: EnvironmentsEnum;
};

export const initializeNetwork = async ({
  customNetworkConfig = {},
  environment
}: InitializeNetworkPropsType) => {
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
      networkStore.getState().initializeNetworkConfig(apiConfig);
      return;
    }
  }

  networkStore.getState().initializeNetworkConfig(localConfig);
};
