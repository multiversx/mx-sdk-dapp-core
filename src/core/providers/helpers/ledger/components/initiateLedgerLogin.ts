import { LedgerConnectModal } from './LedgerConnectModal/LedgerModalComponent';

export async function initiateLedgerLogin() {
  if (!customElements.get('ledger-connect-modal')) {
    customElements.define('ledger-connect-modal', LedgerConnectModal);
  }

  const modalElement = document.createElement(
    'ledger-connect-modal'
  ) as LedgerConnectModal;

  document.body.appendChild(modalElement);
}
