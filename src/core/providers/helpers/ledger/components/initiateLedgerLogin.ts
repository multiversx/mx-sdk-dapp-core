import { LedgerModalComponent } from './LedgerModalComponent/LedgerModalComponent';

export async function initiateLedgerLogin(props: {
  getAccounts: (page?: number, pageSize?: number) => Promise<string[]>;
  onSubmit: (props: { addressIndex: number }) => Promise<{
    address: string;
    signature?: string;
  }>;
  version?: string;
  token?: string;
}) {
  // TODO: add this as param
  if (!customElements.get('ledger-connect-modal')) {
    customElements.define('ledger-connect-modal', LedgerModalComponent);
  }

  const modalElement = document.createElement(
    'ledger-connect-modal'
  ) as LedgerModalComponent;

  modalElement.getAccounts = props.getAccounts;
  modalElement.version = props.version ?? '';
  modalElement.loginToken = props.token ?? '';

  document.body.appendChild(modalElement);

  const selectedAccount = await new Promise<{
    address: string;
    addressIndex: number;
    signature?: string;
  }>((resolve) => {
    modalElement.open(); // TODO: remove

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
