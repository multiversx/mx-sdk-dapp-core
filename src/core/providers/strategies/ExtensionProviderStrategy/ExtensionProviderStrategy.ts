import { Message } from '@multiversx/sdk-core/out';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider/out/extensionProvider';
import {
  PendingTransactionsStateManager,
  PendingTransactionsEventsEnum
} from 'core/managers';
import { getAccount } from 'core/methods/account/getAccount';
import { getAddress } from 'core/methods/account/getAddress';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { PendingTransactionsModal } from 'lib/sdkDappCoreUi';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createModalElement } from 'utils/createModalElement';

export class ExtensionProviderStrategy {
  private address: string = '';
  private provider: ExtensionProvider | null = null;
  private _signMessage: ((message: Message) => Promise<Message>) | null = null;

  constructor(address?: string) {
    this.address = address || '';
  }

  public createProvider = async (): Promise<IProvider> => {
    this.initialize();

    if (!this.provider) {
      this.provider = ExtensionProvider.getInstance();
      await this.provider.init();
    }

    this._signMessage = this.provider.signMessage.bind(this.provider);

    return this.buildProvider();
  };

  private buildProvider = () => {
    const { address } = getAccount();

    if (!this.provider) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const provider = this.provider as unknown as IProvider;
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
