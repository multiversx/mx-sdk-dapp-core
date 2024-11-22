import { DappProvider } from './DappProvider';
import { emptyProvider } from './helpers/emptyProvider';
import { IProvider } from 'core/providers/types/providerFactory.types';

export type ProvidersType = IProvider;

let accountProvider: DappProvider = new DappProvider(emptyProvider);

export function setAccountProvider<TProvider extends DappProvider>(
  provider: TProvider
) {
  accountProvider = provider;
}

export function getAccountProvider(): DappProvider {
  return (accountProvider as DappProvider) || emptyProvider;
}
