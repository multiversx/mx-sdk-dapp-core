import type { CustomElementsDefineOptions } from '@multiversx/sdk-dapp-core-ui/loader';
export type { LedgerConnectModal } from '@multiversx/sdk-dapp-core-ui/dist/components/ledger-connect-modal';
export type { LedgerConnect } from '@multiversx/sdk-dapp-core-ui/dist/components/ledger-connect';
export type { SignTransactionsModal } from '@multiversx/sdk-dapp-core-ui/dist/components/sign-transactions-modal';
export type { WalletConnectModal } from '@multiversx/sdk-dapp-core-ui/dist/components/wallet-connect-modal';
export type { WalletConnect } from '@multiversx/sdk-dapp-core-ui/dist/components/wallet-connect';
export type { PendingTransactionsPanel } from '@multiversx/sdk-dapp-core-ui/dist/components/pending-transactions-panel';
export { type IPendingTransactionsPanelData } from '@multiversx/sdk-dapp-core-ui/dist/types/components/functional/pending-transactions-panel/pending-transactions-panel.types.d';
export type { NotificationsFeed } from '@multiversx/sdk-dapp-core-ui/dist/components/notifications-feed';
export type { ToastList } from '@multiversx/sdk-dapp-core-ui/dist/components/toast-list';
export type { IEventBus } from '@multiversx/sdk-dapp-core-ui/dist/types/utils/EventBus';
export type {
  ITransactionListItem,
  ITransactionListItemAsset,
  ITransactionListItemAction,
  ITransactionListItemDetails
} from '@multiversx/sdk-dapp-core-ui/dist/types/components/visual/transaction-list-item/transaction-list-item.types.d.ts';

export async function defineCustomElements(
  win?: Window,
  opts?: CustomElementsDefineOptions
): Promise<void> {
  try {
    const loader = await import('@multiversx/sdk-dapp-core-ui/loader');
    loader.defineCustomElements(win, opts);
  } catch (err) {
    throw new Error('@multiversx/sdk-dapp-core-ui not found' + err);
  }
}
