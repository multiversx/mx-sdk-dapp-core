import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ledgerStyles } from './ldegerModalComponent.styles';
import { ILedgerAccount } from '../ledger.types';
import BigNumber from 'bignumber.js';
import { fetchAccount } from 'utils/account/fetchAccount';

@customElement('account-connect-modal')
export class WalletConnectModalComponent extends LitElement {
  @property({ type: Boolean }) isOpen = false;
  @property({ type: Array }) accounts: ILedgerAccount[] = [];
  @property({ type: Function }) getAccounts?: (
    page?: number,
    pageSize?: number
  ) => Promise<string[]>;

  // Internal state for pagination
  @property({ type: Number }) private startIndex = 0;
  @property({ type: Number }) private addressesPerPage = 10;

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
    await this.fetchAccounts();
  }

  private async fetchAccounts() {
    if (!this.getAccounts) {
      console.error('getAccounts function not provided');
      return;
    }

    try {
      const accounts = await this.getAccounts?.(
        this.startIndex,
        this.addressesPerPage
      );

      const accountsWithBalance: ILedgerAccount[] = [];

      const balancePromises = accounts.map((address) => fetchAccount(address));

      const balances = await Promise.all(balancePromises);

      balances.forEach((account, index) => {
        if (!account) {
          return;
        }
        accountsWithBalance.push({
          address: account.address,
          balance: account.balance,
          index
        });
      });

      this.accounts = accountsWithBalance;
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  }

  async prevPage() {
    if (this.startIndex > 0) {
      this.startIndex = Math.max(0, this.startIndex - this.addressesPerPage);
      await this.fetchAccounts();
    }
  }

  async nextPage() {
    this.startIndex += this.addressesPerPage;
    await this.fetchAccounts();
  }

  close() {
    this.isOpen = false;
  }

  accessWallet() {
    // Implement wallet access logic
  }
}

export function createModalFunctions(props: {
  getAccounts: (page?: number, pageSize?: number) => Promise<string[]>;
}) {
  const modalElement = document.createElement(
    'account-connect-modal'
  ) as WalletConnectModalComponent;

  modalElement.getAccounts = props.getAccounts;

  document.body.appendChild(modalElement);

  return {
    openModal: () => {
      modalElement.open();
    },
    closeModal: () => {
      modalElement.close();
    }
  };
}
