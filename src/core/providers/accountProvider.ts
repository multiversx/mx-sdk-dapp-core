import { IDappProvider } from 'types/dappProvider.types';
import { emptyProvider } from './helpers/emptyProvider';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';

export type ProvidersType = IDappProvider | CrossWindowProvider;

let accountProvider: ProvidersType = emptyProvider;

export function setAccountProvider<TProvider extends ProvidersType>(
  provider: TProvider
) {
  accountProvider = provider;
}

export function getAccountProvider(): IDappProvider {
  return (accountProvider as IDappProvider) || emptyProvider;
}
