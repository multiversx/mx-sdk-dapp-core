import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ledgerStyles } from './ldegerModalComponent.styles';
import { ILedgerAccount } from '../ledger.types';
import BigNumber from 'bignumber.js';

@customElement('account-connect-modal')
export class WalletConnectModalComponent extends LitElement {
  @property({ type: Boolean }) isOpen = false;
  @property({ type: Array }) accounts: ILedgerAccount[] = [];

  static styles = ledgerStyles;

  render() {
    return html`
      <div class="modal" style="display: ${this.isOpen ? 'block' : 'none'}">
        <div class="modal-content">
          <div class="modal-header">
            <span class="close" @click=${this.close}>✕</span>
            <h2>Access your wallet</h2>
            <p>Choose the wallet you want to access</p>
          </div>

          <div class="account-list">${this.renderAccounts()}</div>

          <div class="navigation">
            <button @click=${this.prevPage}>Prev</button>
            <button @click=${this.nextPage}>Next</button>
          </div>

          <button class="access-button" @click=${this.accessWallet}>
            Access Wallet
          </button>
        </div>
      </div>
    `;
  }

  private renderAccounts() {
    function trimAddress(s: string): string {
      const firstFour = s.slice(0, 4); // Get the first four characters
      const lastFour = s.slice(-4); // Get the last four characters
      return `${firstFour}...${lastFour}`; // Combine them with three dots in between
    }
    function formatAmount(amount: string) {
      const number = new BigNumber(amount);
      const formattedNumber = number
        .dividedBy(BigNumber(10).pow(18))
        .toFormat(4)
        .toString();
      return formattedNumber;
    }
    return html`
      <div class="account-header">
        <span>Address</span>
        <span>Balance</span>
        <span>#</span>
      </div>
      ${this.accounts.map(
        (account) => html`
          <div class="account-row">
            <input
              type="radio"
              name="account"
              ?checked=${account.index === 0}
              value=${account.index}
            />
            <span class="address">${trimAddress(account.address)}</span>
            <span class="balance">${formatAmount(account.balance)}</span>
            <span class="index">${account.index}</span>
          </div>
        `
      )}
    `;
  }

  async open() {
    this.isOpen = true;
    this.requestUpdate();
  }

  updateAccounts(accounts: ILedgerAccount[]) {
    this.accounts = accounts;
  }

  close() {
    this.isOpen = false;
  }

  prevPage() {
    // Implement pagination logic
  }

  nextPage() {
    // Implement pagination logic
  }

  accessWallet() {
    // Implement wallet access logic
  }
}

export function createModalFunctions() {
  const modalElement = document.createElement(
    'account-connect-modal'
  ) as WalletConnectModalComponent;
  document.body.appendChild(modalElement);

  return {
    openModal: async () => {
      await modalElement.open();
    },
    closeModal: () => {
      modalElement.close();
    },
    updateLedgerAccounts: (accounts: ILedgerAccount[]) => {
      modalElement.updateAccounts(accounts);
    }
  };
}
