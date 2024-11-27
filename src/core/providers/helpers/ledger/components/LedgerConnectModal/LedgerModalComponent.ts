import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ledgerStyles } from './ledgerConnectModal.styles';
import { EventBus } from '../EventBus';
import { renderAccounts } from './components/renderAccounts';
import { renderInModal } from './components/renderInModal';
import {
  ILedgerConnectModalData,
  LedgerConnectEventsEnum
} from './ledgerConnectModal.types';

@customElement('ledger-connect-modal')
export class LedgerConnectModal extends LitElement {
  @property({ type: Object }) public data: ILedgerConnectModalData = {
    accountScreenData: null,
    confirmScreenData: null,
    connectScreenData: {}
  };

  @property({ type: Number }) private selectedIndex = 0;
  @property({ type: String }) private selectedAddress = '';

  static styles = ledgerStyles;

  private eventBus: EventBus = EventBus.getInstance();

  render = () => {
    const { accountScreenData, confirmScreenData, connectScreenData } =
      this.data;

    if (accountScreenData) {
      const isSelectedIndexOnPage = accountScreenData.accounts.some(
        ({ index }) => index === this.selectedIndex
      );

      const accountsList =
        accountScreenData.isLoading || accountScreenData.accounts.length === 0
          ? html`<div class="spinner"></div>`
          : renderAccounts({
              shownAccounts: accountScreenData.accounts,
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
                        ?disabled="${accountScreenData.startIndex <= 0}"
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

    if (confirmScreenData) {
      return renderInModal({
        onClose: () => this.close(),
        title: html`Confirm`,
        subtitle: html`Confirm Ledger Address`,
        body: html`<div
          data-testid="ledgerConfirmAddress"
          class="ledger-confirm-address-section"
        >
          <div class="ledger-confirm-address-section">
            <div>${confirmScreenData.confirmAddressText}</div>
            <div>${confirmScreenData.selectedAddress}</div>
          </div>

          <div class="ledger-confirm-address-section">
            <div class="ledger-confirm-address-description">
              ${confirmScreenData?.authText}
            </div>
            <div class="ledger-confirm-address-data">
              ${confirmScreenData?.data}
            </div>
            <div class="ledger-confirm-address-description">
              ${confirmScreenData?.areShownText}
            </div>
          </div>

          <div class="ledger-confirm-address-footer">
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

    // connectScreenData
    return renderInModal({
      onClose: () => this.close(),
      title: html`Connect Ledger`,
      subtitle: html`Unlock your device &amp; open the MultiversX App`,
      body: html`<div>
        ${connectScreenData?.error && html`<p>${connectScreenData.error}</p>`}
        ${connectScreenData?.customContentMarkup &&
        html`${connectScreenData?.customContentMarkup}`}

        <button
          class="access-button"
          @click=${() =>
            this.eventBus.publish(LedgerConnectEventsEnum.CONNECT_DEVICE)}
          ?disabled=${connectScreenData?.disabled}
        >
          Connect Ledger
        </button>
        <a
          href="https://support.ledger.com/hc/en-us/articles/115005165269-Connection-issues-with-Windows-or-Linux"
          target="_blank"
          rel="noopener noreferrer"
        >
          Having connection issues?
        </a>
      </div>`
    });
  };

  private accessWallet() {
    this.eventBus.publish(LedgerConnectEventsEnum.ACCESS_WALLET, {
      addressIndex: this.selectedIndex,
      selectedAddress:
        this.selectedAddress ||
        this.data.accountScreenData?.accounts.find(
          ({ index }) => index === this.selectedIndex
        )?.address ||
        ''
    });
  }

  private selectAccount(index: number) {
    this.selectedIndex = index;
    this.selectedAddress =
      this.data.accountScreenData?.accounts.find(
        ({ index }) => index === this.selectedIndex
      )?.address ?? '';
  }

  async nextPage() {
    this.eventBus.publish(LedgerConnectEventsEnum.NEXT_PAGE);
  }

  async prevPage() {
    this.eventBus.publish(LedgerConnectEventsEnum.PREV_PAGE);
  }

  close(props = { isUserClick: true }) {
    if (props.isUserClick) {
      this.eventBus.publish(LedgerConnectEventsEnum.CLOSE);
    }
    // allow a final update before close
    setTimeout(() => {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    });
  }

  private dataUpdate(payload: ILedgerConnectModalData) {
    if (payload.shouldClose) {
      return this.close({ isUserClick: false });
    }
    this.data = payload;
    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
    this.eventBus.subscribe(
      LedgerConnectEventsEnum.DATA_UPDATE,
      this.dataUpdate.bind(this)
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.eventBus.unsubscribe(
      LedgerConnectEventsEnum.DATA_UPDATE,
      this.dataUpdate.bind(this)
    );
  }
}
