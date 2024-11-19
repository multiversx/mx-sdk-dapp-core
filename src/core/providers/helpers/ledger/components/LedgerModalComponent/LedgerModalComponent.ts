import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ledgerStyles } from './ldegerModalComponent.styles';
import { ILedgerAccount } from '../../ledger.types';
import { renderInModal } from './components/renderInModal';
import { renderAccounts } from './components/renderAccounts';
import { EventBus } from '../EventBus';

interface ILedgerModalData {
  accounts: ILedgerAccount[];
  startIndex: number;
  addressesPerPage: number;
  isLoading: boolean;
  showConfirm: boolean;
  selectedAddress: string;
  confirmScreenData?: {
    data: string;
    confirmAddressText: string;
    authText: string;
    areShownText?: undefined;
  };
}

@customElement('ledger-connect-modal')
export class LedgerModalComponent extends LitElement {
  @property({ type: Object }) public myData: ILedgerModalData = {
    accounts: [],
    startIndex: 0,
    addressesPerPage: 10,
    isLoading: true,
    showConfirm: false,
    selectedAddress: ''
  };

  @property({ type: Number }) public selectedIndex = 1;

  static styles = ledgerStyles;

  private eventBus: EventBus = EventBus.getInstance();

  render = () => {
    const isSelectedIndexOnPage = this.myData.accounts.some(
      ({ index }) => index === this.selectedIndex
    );

    const authTokenText = this.myData.confirmScreenData;

    if (this.myData.showConfirm) {
      return renderInModal({
        onClose: () => this.close(),
        title: html`Confirm`,
        subtitle: html`Confirm Ledger Address`,
        body: html`<div data-testid="ledgerConfirmAddress">
          <div>
            <div>${authTokenText?.confirmAddressText}</div>
            <div>${this.myData.selectedAddress}</div>
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
      this.myData.isLoading || this.myData.accounts.length === 0
        ? html`<div class="spinner"></div>`
        : renderAccounts({
            shownAccounts: this.myData.accounts,
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
                ?disabled="${this.myData.startIndex <= 0}"
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
      addressIndex: this.selectedIndex
    });
  }

  private selectAccount(index: number) {
    this.selectedIndex = index;
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
    this.eventBus.publish('CLOSE');
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  }

  private dataUpdate(payload: ILedgerModalData) {
    this.myData = payload;
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
