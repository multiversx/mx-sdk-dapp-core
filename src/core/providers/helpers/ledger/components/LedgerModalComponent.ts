import { LitElement, TemplateResult, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ledgerStyles } from './ldegerModalComponent.styles';
import { ILedgerAccount } from '../ledger.types';
import BigNumber from 'bignumber.js';
import { fetchAccount } from 'utils/account/fetchAccount';
import { getAuthTokenText } from './getAuthTokenText';

@customElement('account-connect-modal')
export class WalletConnectModalComponent extends LitElement {
  @property({ type: Boolean }) isOpen = false;
  @property({ type: Array }) accounts: ILedgerAccount[] = [];
  // external props
  @property({ type: String }) loginToken = '';
  @property({ type: String }) version = '';
  @property({ type: Function }) getAccounts?: (
    page?: number,
    pageSize?: number
  ) => Promise<string[]>;
  @property({ type: Function }) onSubmit?: (props: {
    addressIndex: number;
  }) => Promise<{
    address: string;
    addressIndex: number;
    signature?: string;
  }>;

  @property({ type: Number }) private startIndex = 0;
  @property({ type: Number }) private addressesPerPage = 10;
  @property({ type: Boolean }) private isLoading = false;
  @property({ type: Boolean }) private showConfirm = false;
  @property({ type: Number }) public selectedIndex = 0;
  @property({ type: String }) public selectedAddress = '';
  @property({ type: String }) public signature = '';

  static styles = ledgerStyles;

  render() {
    const shownAccounts = this.accounts.slice(
      this.startIndex,
      this.startIndex + this.addressesPerPage
    );
    const isSelectedIndexOnPage = shownAccounts.some(
      ({ index }) => index === this.selectedIndex
    );

    if (this.showConfirm) {
      const authTokenText = getAuthTokenText({
        loginToken: this.loginToken,
        version: this.version
      });

      return this.renderInModal({
        title: html`Confirm`,
        subtitle: html`Confirm Ledger Address`,
        body: html`<div data-testid="ledgerConfirmAddress">
          <div>
            <div>${authTokenText?.confirmAddressText}</div>
            <div>${this.selectedAddress}</div>
          </div>

          <div>
            <div>${authTokenText?.authText}</div>
            <div>${authTokenText?.data}</div>
            <div>${authTokenText?.areShownText}</div>
          </div>

          <div>
            <div>Select Approve on your device to confirm.</div>

            <div>
              Or, if it does not match, close this page and{' '}
              <a
                href="https://help.multiversx.com/en/"
                target="_blank"
                rel="noreferrer"
              >
                contact support
              </a>
              .
            </div>
          </div>
        </div>`
      });
    }

    return this.renderInModal({
      title: html`Access your wallet`,
      subtitle: html`Choose the wallet you want to access`,
      body: html`
        <div>
            <div class="account-list">
              ${
                this.isLoading || this.accounts.length === 0
                  ? html`<div class="spinner"></div>`
                  : this.renderAccounts(shownAccounts)
              }
            </div>
            <div class="navigation">
              <button
                @click=${this.prevPage}
                ?disabled="${this.startIndex <= 0}"
              >
                Prev
              </button>
              <button @click=${this.nextPage}>Next</button>
            </div>

            <button
              class="access-button"
              @click=${this.accessWallet}
              ?disabled=${!isSelectedIndexOnPage}
            >
              Access Wallet
            </button>
          </div>
        </div>
      `
    });
  }

  private accessWallet() {
    if (!this.onSubmit) {
      console.error('onSubmit function not provided');
      return;
    }
    this.showConfirm = true;
    this.onSubmit({ addressIndex: this.selectedIndex });
  }

  private renderInModal<T extends TemplateResult>({
    body,
    title,
    subtitle
  }: {
    body: T;
    title: T;
    subtitle: T;
  }) {
    return html`
      <div class="modal" style="display: ${this.isOpen ? 'block' : 'none'}">
        <div class="modal-content">
          <div class="modal-header">
            <span class="close" @click=${this.close}>✕</span>
            <h2>${title}</h2>
            <p>${subtitle}</p>
          </div>
          ${body}
        </div>
      </div>
    `;
  }

  private renderAccounts(shownAccounts: ILedgerAccount[]) {
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
      ${shownAccounts.map(
        (account) => html`
          <div
            class="account-row"
            @click=${() => this.selectAccount(account.index)}
          >
            <input
              type="radio"
              name="account"
              ?checked=${account.index === this.selectedIndex}
              value=${account.index}
            />
            <span class="address">${trimAddress(account.address)}</span>
            <span class="balance">${formatAmount(account.balance ?? '')}</span>
            <span class="index">${account.index}</span>
          </div>
        `
      )}
    `;
  }

  private selectAccount(index: number) {
    this.selectedIndex = index;

    this.selectedAddress =
      this.accounts.find((account) => account.index === index)?.address ?? '';

    this.requestUpdate();
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
}

export async function initiateLedgerLogin(props: {
  getAccounts: (page?: number, pageSize?: number) => Promise<string[]>;
  onSubmit: (props: { addressIndex: number }) => Promise<{
    address: string;
    signature?: string;
  }>;
}) {
  const modalElement = document.createElement(
    'account-connect-modal'
  ) as WalletConnectModalComponent;

  modalElement.getAccounts = props.getAccounts;

  document.body.appendChild(modalElement);
  modalElement.open();

  const selectedAccount = await new Promise<{
    address: string;
    addressIndex: number;
    signature?: string;
  }>((resolve) => {
    modalElement.onSubmit = async ({ addressIndex }) => {
      const { address, signature } = await props.onSubmit({ addressIndex });

      resolve({
        address,
        signature,
        addressIndex
      });

      document.body.removeChild(modalElement);

      return {
        address,
        signature,
        addressIndex
      };
    };
  });

  return selectedAccount;
}
