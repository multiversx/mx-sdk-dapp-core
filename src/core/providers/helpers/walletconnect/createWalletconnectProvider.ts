import { WalletConnectV2Provider } from '@multiversx/sdk-wallet-connect-provider';
import { IProvider } from 'core/providers/types/providerFactory.types';
import QRCode from 'qrcode';
import { networkSelector } from 'store/selectors';
import { getState } from 'store/store';

export function createWalletconnectProvider() {
  const network = networkSelector(getState());
  const provider = new WalletConnectV2Provider(
    prepareCallbacks(),
    network.chainId,
    network.walletConnectV2RelayAddress,
    String(network.walletConnectV2ProjectId)
  );

  const createdProvider = provider as unknown as IProvider;

  function prepareCallbacks() {
    return {
      onClientLogin: async function () {
        closeModal();
        const address = provider.getAddress();
        console.log(`onClientLogin(), address: ${address}`);
      },
      onClientLogout: function () {
        console.log('onClientLogout()');
      },
      onClientEvent: function (event: any) {
        console.log('onClientEvent()', event);
      }
    };
  }

  createdProvider.login = async (options?: {
    callbackUrl?: string;
    token?: string;
  }): Promise<{ address: string; signature: string }> => {
    await provider.init();
    const { uri, approval } = await provider.connect();

    if (!uri) {
      throw 'URI not found';
    }

    await openModal(uri);

    try {
      const account = await provider.login({
        approval,
        token: options?.token
      });

      const address = account?.address;
      const signature = account?.signature;

      if (!account) {
        throw new Error('Connection Proposal Refused');
      }

      return {
        address: address || '',
        signature: signature || ''
      };
    } catch (err) {
      throw new Error('Connection Proposal Refused');
    }
  };

  return createdProvider;
}

async function openModal(connectorUri: string) {
  const svg = await QRCode.toString(connectorUri, { type: 'svg' });

  // Check if the modal already exists
  let modal = document.getElementById('MyWalletConnectV2Modal');

  if (!modal) {
    // Create the modal HTML
    modal = document.createElement('div');
    modal.id = 'MyWalletConnectV2Modal';
    modal.className = 'modal';

    const modalDialog = document.createElement('div');
    modalDialog.className = 'modal-dialog';
    modal.appendChild(modalDialog);

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalDialog.appendChild(modalContent);

    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    modalContent.appendChild(modalHeader);

    const modalTitle = document.createElement('h4');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = 'Connect using xPortal on your phone';
    modalHeader.appendChild(modalTitle);

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'close';
    closeButton.textContent = '×';
    closeButton.onclick = closeModal;
    modalHeader.appendChild(closeButton);

    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    modalContent.appendChild(modalBody);

    const qrContainer = document.createElement('div');
    qrContainer.id = 'MyWalletConnectV2QRContainer';
    modalBody.appendChild(qrContainer);

    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    modalContent.appendChild(modalFooter);

    const closeButtonFooter = document.createElement('button');
    closeButtonFooter.type = 'button';
    closeButtonFooter.className = 'btn btn-danger';
    closeButtonFooter.textContent = 'Close';
    closeButtonFooter.onclick = closeModal;
    modalFooter.appendChild(closeButtonFooter);

    // Append the modal to the body
    document.body.appendChild(modal);
  }

  // Get the QR container
  const qrContainer = document.getElementById('MyWalletConnectV2QRContainer');

  if (qrContainer) {
    qrContainer.innerHTML = svg;
  }

  // Show the modal
  modal.classList.add('show');
  modal.style.display = 'block';
}

function closeModal() {
  const modal = document.getElementById('MyWalletConnectV2Modal');

  if (modal) {
    modal.classList.remove('show');
    modal.style.display = 'none';
  }
}
