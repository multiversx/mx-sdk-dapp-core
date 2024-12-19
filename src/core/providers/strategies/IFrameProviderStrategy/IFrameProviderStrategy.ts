import { Message, Transaction } from '@multiversx/sdk-core/out';
import { IframeProvider } from '@multiversx/sdk-web-wallet-iframe-provider/out';
import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';
import {
  PendingTransactionsStateManager,
  PendingTransactionsEventsEnum
} from 'core/managers';
import { getAccount } from 'core/methods/account/getAccount';
import { getAddress } from 'core/methods/account/getAddress';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { PendingTransactionsModal } from 'lib/sdkDappCoreUi';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';
import { ProviderErrorsEnum } from 'types';
import { createModalElement } from 'utils/createModalElement';
import { IFrameProviderType } from './types';

export class IFrameProviderStrategy {
  private provider: IframeProvider | null = null;
  private address?: string;
  private type: IframeLoginTypes | null = null;
  private _signTransactions:
    | ((transactions: Transaction[]) => Promise<Transaction[]>)
    | null = null;
  private _signMessage: ((message: Message) => Promise<Message>) | null = null;

  constructor({ type, address }: IFrameProviderType) {
    this.type = type;
    this.address = address;
  }

  public createProvider = async (): Promise<IProvider> => {
    this.initialize();
    const network = networkSelector(getState());

    if (!this.type) {
      throw new Error(ProviderErrorsEnum.invalidType);
    }

    if (!this.provider) {
      this.provider = IframeProvider.getInstance();
      await this.provider.init();
    }

    this.provider.setLoginType(this.type);
    this.provider.setWalletUrl(String(network.iframeWalletAddress));
    this._signTransactions = this.provider.signTransactions.bind(this.provider);
    this._signMessage = this.provider.signMessage.bind(this.provider);

    return this.buildProvider();
  };

  private buildProvider = () => {
    const { address } = getAccount();

    if (!this.provider) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const provider = this.provider as unknown as IProvider;

    provider.setAccount({ address: this.address || address });
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

    const modalElement = await createModalElement<PendingTransactionsModal>(
      'pending-transactions-modal'
    );
    const eventBus = await modalElement.getEventBus();

    if (!eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
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
      title: `Confirm on MultiversX ${this.type}`,
      subtitle: `Check your MultiversX ${this.type} to sign the transaction`
    });
    try {
      const signedTransactions: Transaction[] =
        await this._signTransactions(transactions);

      return signedTransactions;
    } catch (error) {
      this.provider.cancelAction();
      throw error;
    } finally {
      onClose(false);
      eventBus.unsubscribe(PendingTransactionsEventsEnum.CLOSE, onClose);
    }
  };

  private signMessage = async (message: Message) => {
    if (!this.provider || !this._signMessage || !this.type) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const modalElement = await createModalElement<PendingTransactionsModal>(
      'pending-transactions-modal'
    );
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

    eventBus.subscribe(PendingTransactionsEventsEnum.CLOSE, onClose);

    manager.updateData({
      isPending: true,
      title: 'Message Signing',
      subtitle: `Check your MultiversX ${this.type} to sign the message`
    });

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
}
