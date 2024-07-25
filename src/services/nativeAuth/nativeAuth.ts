import { NativeAuthClient } from '@multiversx/sdk-native-auth-client';

import {
  getLatestBlockHash,
  LatestBlockHashType
} from './helpers/getLatestBlockHash';

import { buildNativeAuthConfig, getTokenExpiration } from './methods';
import { NativeAuthConfigType } from './nativeAuth.types';

interface NativeAuthInitType {
  extraInfo?: { [key: string]: string };
  latestBlockInfo?: LatestBlockHashType;
  noCache?: boolean;
}

export const nativeAuth = (config?: NativeAuthConfigType) => {
  const {
    origin,
    apiAddress,
    expirySeconds,
    blockHashShard,
    extraInfo: extraInfoFromConfig,
    gatewayUrl,
    extraRequestHeaders
  } = buildNativeAuthConfig(config) as NativeAuthConfigType;

  const nativeAuthClient = new NativeAuthClient({
    origin,
    apiUrl: apiAddress,
    expirySeconds,
    blockHashShard,
    gatewayUrl,
    extraRequestHeaders
  });

  const initialize = async (
    initProps?: NativeAuthInitType
  ): Promise<string> => {
    if (!apiAddress || !origin) {
      return '';
    }

    const getBlockHash = (): Promise<string> =>
      nativeAuthClient.getCurrentBlockHash();
    const response =
      initProps?.latestBlockInfo ??
      (await getLatestBlockHash(
        apiAddress,
        blockHashShard,
        getBlockHash,
        initProps?.noCache
      ));
    console.log(response);

    const { hash, timestamp } = response;
    const encodedExtraInfo = nativeAuthClient.encodeValue(
      JSON.stringify({
        ...(initProps?.extraInfo ?? extraInfoFromConfig),
        ...(timestamp ? { timestamp } : {})
      })
    );
    const encodedOrigin = nativeAuthClient.encodeValue(origin);

    return `${encodedOrigin}.${hash}.${expirySeconds}.${encodedExtraInfo}`;
  };

  const getToken = ({
    address,
    token,
    signature
  }: {
    address: string;
    token: string;
    signature: string;
  }): string => nativeAuthClient.getToken(address, token, signature);

  return {
    initialize,
    getToken,
    getTokenExpiration
  };
};
