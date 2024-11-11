import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ledger-connect-modal')
export class LedgerConnectModalComponent extends LitElement {
  @property({ type: Boolean }) isOpen = false;
  @property({ type: String }) qrCodeData = '';

  static styles = css`
    .modal {
      display: none;
      position: fixed;
      z-index: 1000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.4);
    }
    .modal-content {
      background-color: #fefefe;
      margin: 15% auto;
      padding: 20px;
      border: 1px solid #888;
      width: 80%;
      max-width: 500px;
    }
    .close {
      color: #aaa;
      float: right;
      font-size: 28px;
      font-weight: bold;
      cursor: pointer;
    }
    .close:hover,
    .close:focus {
      color: black;
      text-decoration: none;
      cursor: pointer;
    }
  `;

  render() {
    return html`
      <div class="modal" style="display: ${this.isOpen ? 'block' : 'none'}">
        <div class="modal-content">
          <span class="close" @click=${this.close}>&times;</span>
          <h4>This is ledger</h4>
          <div id="qrContainer"></div>
          <button @click=${this.close}>Close</button>
        </div>
      </div>
    `;
  }

  async open() {
    this.isOpen = true;
    this.qrCodeData = 'asd';
    this.requestUpdate();
    await this.updateComplete;
    const qrContainer = this.shadowRoot!.getElementById('qrContainer');
    if (qrContainer) {
      qrContainer.innerHTML = this.qrCodeData;
    }
  }

  close() {
    this.isOpen = false;
  }
}

export function createModalFunctions() {
  const modalElement = document.createElement(
    'ledger-connect-modal'
  ) as LedgerConnectModalComponent;
  document.body.appendChild(modalElement);

  return {
    openModal: async () => {
      await modalElement.open();
    },
    closeModal: () => {
      modalElement.close();
    }
  };
}
