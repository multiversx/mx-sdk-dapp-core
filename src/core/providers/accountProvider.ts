import { CrossWindowProvider } from '@multiversx/sdk-web-wallet-cross-window-provider/out/CrossWindowProvider/CrossWindowProvider';
import { IDappProvider } from 'types/dappProvider.types';
import { emptyProvider } from './helpers/emptyProvider';

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
