import { Message, Transaction } from '@multiversx/sdk-core/out';
import { isBrowserWithPopupConfirmation } from 'constants/browser.constants';
import { getAccount } from 'core/methods/account/getAccount';
import { getAddress } from 'core/methods/account/getAddress';
import { PendingTransactionsEventsEnum } from 'core/providers/helpers/pendingTransactions/pendingTransactions.types';
import { PendingTransactionsStateManager } from 'core/providers/helpers/pendingTransactions/PendingTransactionsStateManagement';
import {
  IProvider,
  ProviderTypeEnum
} from 'core/providers/types/providerFactory.types';
import { PendingTransactionsModal } from 'lib/sdkDappCoreUi';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { crossWindowConfigSelector } from 'store/selectors';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';
import { ProviderErrorsEnum } from 'types';
import { createModalElement } from 'utils/createModalElement';

type CrossWindowProviderProps = {
  address?: string;
  walletAddress?: string;
};

export class CrossWindowProviderStrategy {
  private provider: CrossWindowProvider | null = null;
  private address: string;
  private walletAddress?: string;
  private _signTransactions:
    | ((transactions: Transaction[]) => Promise<Transaction[]>)
    | null = null;
  private _signMessage: ((messageToSign: Message) => Promise<Message>) | null =
    null;

  constructor(config?: CrossWindowProviderProps) {
    this.address = config?.address || '';
    this.walletAddress = config?.walletAddress;
  }

  public createProvider = async (): Promise<IProvider> => {
    this.initialize();
    const network = networkSelector(getState());

    if (!this.provider) {
      this.provider = CrossWindowProvider.getInstance();
      this.provider.init();
    }

    // Bind in order to break reference
    this._signTransactions = this.provider.signTransactions.bind(this.provider);
    this._signMessage = this.provider.signMessage.bind(this.provider);

    this.provider.setWalletUrl(this.walletAddress || network.walletAddress);
    this.provider.setAddress(this.address);

    this.setPopupConsent();

    return this.buildProvider();
  };

  private buildProvider = () => {
    if (!this.provider) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const provider = this.provider as unknown as IProvider;

    provider.setAccount({ address: this.address });
    provider.signTransactions = this.signTransactions;
    provider.signMessage = this.signMessage;

    return provider;
  };

  private initialize = () => {
    if (this.address) {
      return;
    }

    const address = getAddress();

    if (!address) {
      return;
    }

    this.address = address;
  };

  private signTransactions = async (transactions: Transaction[]) => {
    if (!this.provider || !this._signTransactions) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const { eventBus } = await createModalElement<PendingTransactionsModal>({
      name: 'pending-transactions-modal',
      withEventBus: true
    });

    if (!eventBus) {
      throw new Error('Event bus is not initialized');
    }

    const manager = PendingTransactionsStateManager.getInstance(eventBus);

    const onClose = (cancelAction = true) => {
      if (cancelAction && this.provider) {
        this.provider.cancelAction();
      }

      manager.closeAndReset();
    };

    eventBus.subscribe(PendingTransactionsEventsEnum.CLOSE, onClose);

    manager.updateData({
      isPending: true,
      title: 'Confirm on MultiversX Web Wallet',
      subtitle: 'Check your MultiversX Web Wallet to sign the transaction',
      type: ProviderTypeEnum.extension
    });

    this.setPopupConsent();

    try {
      const signedTransactions: Transaction[] =
        (await this._signTransactions(transactions)) ?? [];

      // Guarded Transactions or Signed Transactions
      return this.getTransactions(signedTransactions);
    } catch (error) {
      this.provider.cancelAction();
      throw error;
    } finally {
      onClose(false);
      eventBus.unsubscribe(PendingTransactionsEventsEnum.CLOSE, onClose);
    }
  };

  private signMessage = async (message: Message) => {
    if (!this.provider || !this._signMessage) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const { eventBus } = await createModalElement<PendingTransactionsModal>({
      name: 'pending-transactions-modal',
      withEventBus: true
    });

    if (!eventBus) {
      throw new Error('Event bus is not initialized');
    }

    const manager = PendingTransactionsStateManager.getInstance(eventBus);

    const onClose = (cancelAction = true) => {
      if (!this.provider) {
        throw new Error(ProviderErrorsEnum.notInitialized);
      }

      if (cancelAction) {
        this.provider.cancelAction();
      }

      manager.closeAndReset();
    };

    eventBus.subscribe(PendingTransactionsEventsEnum.CLOSE, onClose);

    manager.updateData({
      isPending: true,
      title: 'Message Signing',
      subtitle: 'Check your MultiversX Web Wallet to sign the message',
      type: ProviderTypeEnum.crossWindow
    });

    this.setPopupConsent();

    try {
      const signedMessage: Message = await this._signMessage(message);

      return signedMessage;
    } catch (error) {
      this.provider.cancelAction();
      throw error;
    } finally {
      onClose(false);
      eventBus.unsubscribe(PendingTransactionsEventsEnum.CLOSE, onClose);
    }
  };

  private setPopupConsent = () => {
    const crossWindowDappConfig = crossWindowConfigSelector(getState());

    if (!this.provider) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    if (
      crossWindowDappConfig?.isBrowserWithPopupConfirmation ||
      isBrowserWithPopupConfirmation
    ) {
      this.provider.setShouldShowConsentPopup(true);
    }
  };

  private getTransactions = async (transactions: Transaction[]) => {
    if (!this.provider) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const { isGuarded } = getAccount();

    const allSignedByGuardian = this.getAreAllTransactionsSignedByGuardian({
      isGuarded,
      transactions
    });

    const needs2FAsigning = isGuarded && !allSignedByGuardian;

    if (needs2FAsigning) {
      const guardedTransactions =
        await this.provider.guardTransactions(transactions);

      return guardedTransactions;
    }

    return transactions;
  };

  private getAreAllTransactionsSignedByGuardian = ({
    transactions,
    isGuarded
  }: {
    transactions: Transaction[];
    isGuarded?: boolean;
  }) => {
    if (!isGuarded) {
      return true;
    }

    if (transactions.length === 0) {
      return false;
    }

    return transactions.every((tx) =>
      Boolean(tx.getGuardianSignature().toString('hex'))
    );
  };
}
