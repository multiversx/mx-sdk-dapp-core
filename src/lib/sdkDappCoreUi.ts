import type { CustomElementsDefineOptions } from '@multiversx/sdk-dapp-core-ui/dist/loader';
export type { MvxLedgerFlow } from '@multiversx/sdk-dapp-core-ui/dist/web-components/mvx-ledger-flow';
export type { MvxSignTransactionsPanel } from '@multiversx/sdk-dapp-core-ui/dist/web-components/mvx-sign-transactions-panel';
export type { MvxWalletConnectProvider } from '@multiversx/sdk-dapp-core-ui/dist/web-components/mvx-wallet-connect-provider';
export type { MvxPendingTransactionsPanel } from '@multiversx/sdk-dapp-core-ui/dist/web-components/mvx-pending-transactions-panel';
export type { IPendingTransactionsPanelData } from '@multiversx/sdk-dapp-core-ui/dist/types/components/functional/pending-transactions-panel/pending-transactions-panel.types.d';
export type { MvxNotificationsFeed } from '@multiversx/sdk-dapp-core-ui/dist/web-components/mvx-notifications-feed';
export type { MvxToastList } from '@multiversx/sdk-dapp-core-ui/dist/web-components/mvx-toast-list';
export type { MvxUnlockPanel } from '@multiversx/sdk-dapp-core-ui/dist/web-components/mvx-unlock-panel';
export type { IEventBus } from '@multiversx/sdk-dapp-core-ui/dist/types/utils/EventBus';
export type {
  ITransactionListItem,
  ITransactionListItemAsset,
  ITransactionListItemAction
} from '@multiversx/sdk-dapp-core-ui/dist/types/components/visual/transaction-list-item/transaction-list-item.types.d.ts';

export async function defineCustomElements(
  win?: Window,
  opts?: CustomElementsDefineOptions
): Promise<void> {
  try {
    const loader = await import('@multiversx/sdk-dapp-core-ui/dist/loader');
    loader.defineCustomElements(win, opts);
  } catch (err) {
    throw new Error('@multiversx/sdk-dapp-core-ui not found' + err);
  }
}
