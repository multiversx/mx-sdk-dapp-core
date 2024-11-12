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
  @property({ type: Boolean }) private isLoading = false;

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

          <div class="account-list">
            ${this.isLoading || this.accounts.length === 0
              ? html`<div class="spinner"></div>`
              : this.renderAccounts()}
          </div>

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
      const firstFour = s.slice(0, 6);
      const lastFour = s.slice(-6);
      return `${firstFour}...${lastFour}`;
    }
    function formatAmount(amount: string) {
      const number = new BigNumber(amount);

      if (number.isNaN()) {
        return amount;
      }

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
      ${this.accounts
        .slice(this.startIndex, this.startIndex + this.addressesPerPage)
        .map(
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
    this.fetchAccounts();
    this.isOpen = true;
  }

  private async fetchAccounts() {
    if (!this.getAccounts) {
      console.error('getAccounts function not provided');
      return;
    }

    const hasData = this.accounts.some(
      ({ index, balance }) =>
        index === this.startIndex && new BigNumber(balance).isFinite()
    );

    if (hasData) {
      return;
    }

    this.isLoading = true;

    try {
      const accounts = await this.getAccounts?.(
        this.startIndex,
        this.addressesPerPage
      );

      const accountsWithBalance: ILedgerAccount[] = accounts.map(
        (address, index) => {
          return {
            address,
            balance: '...',
            index: index + this.startIndex
          };
        }
      );
      this.accounts = [...this.accounts, ...accountsWithBalance];

      this.isLoading = false;

      this.requestUpdate();

      const balancePromises = accounts.map((address) => fetchAccount(address));

      const balances = await Promise.all(balancePromises);

      balances.forEach((account, index) => {
        if (!account) {
          return;
        }
        const accountArrayIndex = index + this.startIndex;
        this.accounts[accountArrayIndex].balance = account.balance;
      });

      this.requestUpdate();
    } catch (error) {
      this.isLoading = false;
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
