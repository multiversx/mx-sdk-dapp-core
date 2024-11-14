import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import BigNumber from 'bignumber.js';
import { ledgerStyles } from './ldegerModalComponent.styles';
import { ILedgerAccount } from '../../ledger.types';
import { fetchAccount } from 'utils/account/fetchAccount';
import { getAuthTokenText } from './helpers/getAuthTokenText';
import { renderInModal } from './components/renderInModal';
import { renderAccounts } from './components/renderAccounts';

@customElement('ledger-connect-modal')
export class LedgerModalComponent extends LitElement {
  @property({ type: Boolean }) isOpen = false;
  @property({ type: Array }) accounts: ILedgerAccount[] = [];
  @property({ type: Number }) private startIndex = 0;
  @property({ type: Number }) private addressesPerPage = 10;
  @property({ type: Boolean }) private isLoading = false;
  @property({ type: Boolean }) private showConfirm = false;
  @property({ type: Number }) public selectedIndex = 0;
  @property({ type: String }) public selectedAddress = '';
  @property({ type: String }) public signature = '';

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

      return renderInModal({
        onClose: () => this.close(),
        isOpen: this.isOpen,
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

    const accountsList =
      this.isLoading || this.accounts.length === 0
        ? html`<div class="spinner"></div>`
        : renderAccounts({
            shownAccounts,
            onSelectAccount: this.selectAccount.bind(this),
            selectedIndex: this.selectedIndex
          });

    return renderInModal({
      onClose: () => this.close(),
      isOpen: this.isOpen,
      title: html`Access your wallet`,
      subtitle: html`Choose the wallet you want to access`,
      body: html`
        <div>
            <div class="account-list">
              ${accountsList}
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

  private selectAccount(index: number) {
    this.selectedIndex = index;

    this.selectedAddress =
      this.accounts.find((account) => account.index === index)?.address ?? '';

    this.requestUpdate();
  }

  async open() {
    this.isOpen = true;
    this.fetchAccounts();
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
