import { emptyProvider } from './helpers/emptyProvider';
import { IProvider } from 'core/providers/types/providerFactory.types';

export type ProvidersType = IProvider;

let accountProvider: ProvidersType = emptyProvider;

export function setAccountProvider<TProvider extends ProvidersType>(
  provider: TProvider
) {
  accountProvider = provider;
}

export function getAccountProvider(): IProvider {
  return (accountProvider as IProvider) || emptyProvider;
}
