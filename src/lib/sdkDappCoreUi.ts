import type { CustomElementsDefineOptions } from '@multiversx/sdk-dapp-core-ui/dist/loader';
export type { LedgerConnectPanel } from '@multiversx/sdk-dapp-core-ui/dist/web-components/ledger-connect-panel';
export type { LedgerConnect } from '@multiversx/sdk-dapp-core-ui/dist/web-components/ledger-connect';
export type {
  IAccountScreenData,
  IConfirmScreenData,
  IConnectScreenData,
  ILedgerAccount,
  ILedgerConnectPanelData
} from '@multiversx/sdk-dapp-core-ui/dist/types/components/functional/ledger-connect-components/ledger-connect.types.d';
export type { SignTransactionsPanel } from '@multiversx/sdk-dapp-core-ui/dist/web-components/sign-transactions-panel';
export type { WalletConnectPanel } from '@multiversx/sdk-dapp-core-ui/dist/web-components/wallet-connect-panel';
export type { WalletConnect } from '@multiversx/sdk-dapp-core-ui/dist/web-components/wallet-connect';
export type { IWalletConnectPanelData } from '@multiversx/sdk-dapp-core-ui/dist/types/components/functional/wallet-connect-components/wallet-connect-panel.types.d';
export type { PendingTransactionsPanel } from '@multiversx/sdk-dapp-core-ui/dist/web-components/pending-transactions-panel';
export { type IPendingTransactionsPanelData } from '@multiversx/sdk-dapp-core-ui/dist/types/components/functional/pending-transactions-panel/pending-transactions-panel.types.d';
export type { NotificationsFeed } from '@multiversx/sdk-dapp-core-ui/dist/web-components/notifications-feed';
export type { ToastList } from '@multiversx/sdk-dapp-core-ui/dist/web-components/toast-list';
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
