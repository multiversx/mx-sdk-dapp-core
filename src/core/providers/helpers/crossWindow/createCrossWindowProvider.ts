import { Transaction } from '@multiversx/sdk-core/out';
import { isBrowserWithPopupConfirmation } from 'constants/browser.constants';
import { safeWindow } from 'constants/window.constants';
import { defineCustomElements, SignTransactionsModal } from 'lib/sdkDappCoreUi';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';
import { SignEventsEnum } from '../components/SignTransactionsModal/signTransactionsModal.types';
import { SignTransactionsStateManager } from '../components/SignTransactionsModal/SignTransactionsStateManager';

interface ICreateCrossWindowProviderProps {
  address?: string;
  walletAddress?: string;
}

export async function createCrossWindowProvider({
  address = '',
  walletAddress = ''
}: ICreateCrossWindowProviderProps) {
  const network = networkSelector(getState());
  const provider = CrossWindowProvider.getInstance();
  await provider.init();
  await defineCustomElements(safeWindow);

  provider.setWalletUrl(walletAddress || network.walletAddress);
  provider.setAddress(address);

  if (isBrowserWithPopupConfirmation) {
    provider.setShouldShowConsentPopup(true);
  }

  const localProvider = new CrossWindowProvider();
  await localProvider.init();
  localProvider.setWalletUrl(walletAddress || network.walletAddress);
  localProvider.setAddress(address);

  provider.signTransactions = async (
    transactions: Transaction[]
  ): Promise<Transaction[]> => {
    // Create sign transactions modal web component
    const signModalElement = document.createElement(
      'sign-transactions-modal'
    ) as SignTransactionsModal;

    document.body.appendChild(signModalElement);

    await customElements.whenDefined('sign-transactions-modal');

    const eventBus = await signModalElement.getEventBus();

    const manager = SignTransactionsStateManager.getInstance(eventBus);
    if (!manager) {
      throw new Error('Unable to establish connection with sign screens');
    }

    const data = new Promise<Transaction[]>((resolve, reject) => {
      const signedTransactions: Transaction[] = [];
      let currentTransactionIndex = 0;

      const signNextTransaction = async () => {
        // If all transactions are signed, resolve

        const currentTransaction = transactions[currentTransactionIndex];

        manager.updateTransaction({
          transaction: currentTransaction.toPlainObject()
        });

        const onCancel = () => {
          reject(new Error('Transaction signing cancelled by user'));
          signModalElement.remove();
        };

        const onSign = async () => {
          try {
            // TODO: check if it's a real transaction or multitransfer step

            const [signedTransaction] = await localProvider.signTransactions([
              currentTransaction
            ]);

            signedTransactions.push(signedTransaction);

            eventBus.unsubscribe(SignEventsEnum.SIGN_TRANSACTION, onSign);
            eventBus.unsubscribe(SignEventsEnum.CLOSE, onCancel);

            currentTransactionIndex++;
            signNextTransaction();
          } catch (error) {
            reject('Error signing transactions' + error);
            signModalElement.remove();
          }
        };

        eventBus.subscribe(SignEventsEnum.SIGN_TRANSACTION, onSign);
        eventBus.subscribe(SignEventsEnum.CLOSE, onCancel);

        if (currentTransactionIndex >= transactions.length) {
          signModalElement.remove();
          eventBus.unsubscribe(SignEventsEnum.SIGN_TRANSACTION, onSign);
          eventBus.unsubscribe(SignEventsEnum.CLOSE, onCancel);
          resolve(signedTransactions);
        }
      };

      signNextTransaction();
    });
    return data;
  };

  return provider;
}
