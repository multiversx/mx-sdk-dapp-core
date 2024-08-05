import { StoreType } from 'store/store.types';

export const configSelector = ({ config }: StoreType) => config;

export const nativeAuthConfigSelector = ({ config }: StoreType) =>
  config.nativeAuthConfig;
