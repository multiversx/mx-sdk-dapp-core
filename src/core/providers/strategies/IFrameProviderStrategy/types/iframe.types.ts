import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';

export type IFrameProviderType = {
  type: IframeLoginTypes;
  address?: string;
};
