import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ledgerStyles } from './ldegerModalComponent.styles';
import { ILedgerAccount } from '../../ledger.types';
import { renderInModal } from './components/renderInModal';
import { renderAccounts } from './components/renderAccounts';
import { EventBus } from '../EventBus';

export interface ILedgerModalData {
  accounts: ILedgerAccount[];
  startIndex: number;
  addressesPerPage: number;
  isLoading: boolean;
  showConfirm: boolean;
  selectedAddress: string;
  shouldClose: boolean;
  confirmScreenData?: {
    data: string;
    confirmAddressText: string;
    authText: string;
    areShownText?: string | null;
  } | null;
}

@customElement('ledger-connect-modal')
export class LedgerModalComponent extends LitElement {
  @property({ type: Object }) public data: ILedgerModalData = {
    accounts: [],
    startIndex: 0,
    addressesPerPage: 10,
    isLoading: true,
    showConfirm: false,
    selectedAddress: '',
    shouldClose: false
  };

  @property({ type: Number }) private selectedIndex = 0;
  @property({ type: Number }) private selectedAddress = '';

  static styles = ledgerStyles;

  private eventBus: EventBus = EventBus.getInstance();

  render = () => {
    const isSelectedIndexOnPage = this.data.accounts.some(
      ({ index }) => index === this.selectedIndex
    );

    const authTokenText = this.data.confirmScreenData;

    if (this.data.showConfirm) {
      return renderInModal({
        onClose: () => this.close(),
        title: html`Confirm`,
        subtitle: html`Confirm Ledger Address`,
        body: html`<div data-testid="ledgerConfirmAddress">
          <div>
            <div>${authTokenText?.confirmAddressText}</div>
            <div>${this.data.selectedAddress}</div>
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
      this.data.isLoading || this.data.accounts.length === 0
        ? html`<div class="spinner"></div>`
        : renderAccounts({
            shownAccounts: this.data.accounts,
            onSelectAccount: this.selectAccount.bind(this),
            selectedIndex: this.selectedIndex
          });

    return renderInModal({
      onClose: () => this.close(),
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
                ?disabled="${this.data.startIndex <= 0}"
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
  };

  private accessWallet() {
    this.eventBus.publish('ACCESS_WALLET', {
      addressIndex: this.selectedIndex,
      selectedAddress: this.selectedAddress
    });
  }

  private selectAccount(index: number) {
    this.selectedIndex = index;
    this.selectedAddress =
      this.data.accounts.find(({ index }) => index === this.selectedIndex)
        ?.address ?? '';
  }

  // private dispatchPageChangeEvent(action: 'next' | 'prev') {
  //   const event = new CustomEvent('page-change', {
  //     detail: {
  //       startIndex: this.startIndex,
  //       action: action
  //     },
  //     bubbles: true,
  //     composed: true
  //   });
  //   this.dispatchEvent(event);
  // }

  async nextPage() {
    this.eventBus.publish('PAGE_CHANGED', {
      action: 'next'
    });
  }

  async prevPage() {
    this.eventBus.publish('PAGE_CHANGED', {
      action: 'prev'
    });
  }

  close() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  private dataUpdate(payload: ILedgerModalData) {
    if (payload.shouldClose) {
      return this.close();
    }
    this.data = payload;
    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
    this.eventBus.subscribe('DATA_UPDATE', this.dataUpdate.bind(this));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.eventBus.unsubscribe('DATA_UPDATE', this.dataUpdate.bind(this));
  }
}
