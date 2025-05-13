import { getGasStationMetadataFromApi } from 'apiCalls/configuration/getGasStationMetadata';
import { initializeNetworkConfig } from 'store/actions/network/networkActions';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';

interface IInitGasStationMetadataParams {
  shard: number;
  apiAddress: string;
}

export async function initGasStationMetadata({
  shard,
  apiAddress
}: IInitGasStationMetadataParams) {
  if (shard == null) {
    return;
  }

  try {
    const fetchedGasMetadata = await getGasStationMetadataFromApi(
      shard,
      apiAddress
    );

    if (!fetchedGasMetadata?.[shard]?.lastBlock) {
      return;
    }

    const network = networkSelector(getState());

    const hasDifferentGasStationMetadata =
      !network.gasStationMetadata ||
      !network.gasStationMetadata[shard] ||
      network.gasStationMetadata[shard].lastBlock !==
        fetchedGasMetadata[shard].lastBlock;

    if (hasDifferentGasStationMetadata) {
      initializeNetworkConfig({
        ...network,
        gasStationMetadata: {
          ...network.gasStationMetadata,
          ...fetchedGasMetadata
        }
      });
    }
  } catch (err) {
    console.error('Error fetching gas station metadata:', err);
  }
}
