import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import QRCode from 'qrcode';

@customElement('wallet-connect-modal')
export class WalletconnectModalComponent extends LitElement {
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
          <h4>Connect using xPortal on your phone</h4>
          <div id="qrContainer"></div>
          <button @click=${this.close}>Close</button>
        </div>
      </div>
    `;
  }

  async open(connectorUri: string) {
    this.isOpen = true;
    this.qrCodeData = await QRCode.toString(connectorUri, { type: 'svg' });
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
    'wallet-connect-modal'
  ) as WalletconnectModalComponent;
  document.body.appendChild(modalElement);

  return {
    openModal: async (connectorUri: string) => {
      await modalElement.open(connectorUri);
    },
    closeModal: () => {
      modalElement.close();
    }
  };
}
