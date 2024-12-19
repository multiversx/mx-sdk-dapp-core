import { Transaction,Message } from '@multiversx/sdk-core/out';
import { IDAppProviderOptions } from '@multiversx/sdk-dapp-utils/out';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider/out/extensionProvider';
import {
  PendingTransactionsStateManager,
  PendingTransactionsEventsEnum
} from 'core/managers';
import { getAccount } from 'core/methods/account/getAccount';
import { getAddress } from 'core/methods/account/getAddress';
import { signTransactions } from 'core/providers/helpers/signTransactions/signTransactions';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { Nullable, ProviderErrorsEnum } from 'types';

import { PendingTransactionsModal } from 'lib/sdkDappCoreUi';
import { createModalElement } from 'utils/createModalElement';

export class ExtensionProviderStrategy {
  private address: string = '';
  private provider: ExtensionProvider | null = null;
  private _signMessage: ((message: Message) => Promise<Message>) | null = null;

  private _signTransactions:
    | ((
        transactions: Transaction[],
        options?: IDAppProviderOptions
      ) => Promise<Nullable<Transaction[]>>)
    | null = null;

  constructor(address?: string) {
    this.address = address || '';
  }

  public createProvider = async (): Promise<IProvider> => {
    this.initialize();

    if (!this.provider) {
      const instance = ExtensionProvider.getInstance();
      this._signTransactions = instance.signTransactions.bind(instance);
      this.provider = instance;
      await this.provider.init();
    }

    this._signTransactions = this.provider.signTransactions.bind(this.provider);
    this._signMessage = this.provider.signMessage.bind(this.provider);

    return this.buildProvider();
  };

  private signTransactions = async (transactions: Transaction[]) => {
    if (!this._signTransactions) {
      throw new Error('Sign transactions method is not initialized');
    }

    const signedTransactions = await signTransactions({
      transactions,
      handleSign: this._signTransactions
    });
    return signedTransactions;
  };

  private buildProvider = () => {
    const { address } = getAccount();

    if (!this.provider) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const provider = this.provider as unknown as IProvider;
    provider.signTransactions = this.signTransactions;
    provider.signMessage = this.signMessage;

    provider.setAccount({ address: this.address || address });
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

  private signMessage = async (message: Message) => {
    if (!this.provider || !this._signMessage) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const modalElement = await createModalElement<PendingTransactionsModal>(
      'pending-transactions-modal'
    );

    const { eventBus, manager, onClose } =
      await this.getModalHandlers(modalElement);

    eventBus.subscribe(PendingTransactionsEventsEnum.CLOSE, onClose);

    manager.updateData({
      isPending: true,
      title: 'Message Signing',
      subtitle: 'Check your MultiversX Wallet Extension to sign the message'
    });

    try {
      const signedMessage = await this._signMessage(message);

      return signedMessage;
    } catch (error) {
      this.provider.cancelAction();
      throw error;
    } finally {
      onClose(false);
      eventBus.unsubscribe(PendingTransactionsEventsEnum.CLOSE, onClose);
    }
  };

  private getModalHandlers = async (modalElement: PendingTransactionsModal) => {
    const eventBus = await modalElement.getEventBus();

    if (!eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
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

    return { eventBus, manager, onClose };
  };
}
