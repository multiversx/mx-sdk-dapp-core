import { Message, Transaction } from '@multiversx/sdk-core/out';
import { IframeProvider } from '@multiversx/sdk-web-wallet-iframe-provider/out';
import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';

import { PendingTransactionsEventsEnum } from 'core/managers/internal/PendingTransactionsStateManager/types/pendingTransactions.types';
import { getAccount } from 'core/methods/account/getAccount';
import { getAddress } from 'core/methods/account/getAddress';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';
import { ProviderErrorsEnum } from 'types/provider.types';
import { IFrameProviderType } from './types';
import { getModalHandlers } from '../helpers/getModalHandlers';

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
      throw new Error(ProviderErrorsEnum.invalidProviderType);
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

    const { eventBus, manager, onClose } = await getModalHandlers({
      cancelAction: this.provider.cancelAction.bind(this.provider)
    });

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

    const { eventBus, manager, onClose } = await getModalHandlers({
      cancelAction: this.provider.cancelAction.bind(this.provider)
    });

    eventBus.subscribe(PendingTransactionsEventsEnum.CLOSE, onClose);

    manager.updateData({
      isPending: true,
      title: 'Message Signing',
      subtitle: `Check your MultiversX ${this.type} to sign the message`
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
}
