import { LedgerModalComponent } from './LedgerModalComponent/LedgerModalComponent';

export async function initiateLedgerLogin() {
  if (!customElements.get('ledger-connect-modal')) {
    customElements.define('ledger-connect-modal', LedgerModalComponent);
  }

  const modalElement = document.createElement(
    'ledger-connect-modal'
  ) as LedgerModalComponent;

  document.body.appendChild(modalElement);
}
