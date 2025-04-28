import { Message, Transaction } from '@multiversx/sdk-core/out';
import { IframeProvider } from '@multiversx/sdk-web-wallet-iframe-provider/out';
import { IframeLoginTypes } from '@multiversx/sdk-web-wallet-iframe-provider/out/constants';

import { PendingTransactionsEventsEnum } from 'core/managers/internal/PendingTransactionsStateManager/types/pendingTransactions.types';
import { getAccount } from 'core/methods/account/getAccount';
import { getAddress } from 'core/methods/account/getAddress';
import {
  IProvider,
  providerLabels
} from 'core/providers/types/providerFactory.types';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';
import { ProviderErrorsEnum } from 'types/provider.types';
import { IFrameProviderType } from './types';
import { getPendingTransactionsHandlers } from '../helpers/getPendingTransactionsHandlers';
import { signMessage } from '../helpers/signMessage/signMessage';
import { withAbortableLogin } from '../helpers/withAbortableLogin/withAbortableLogin';
import { cancelLogin } from '../helpers/cancelLogin/cancelLogin';

export class IFrameProviderStrategy {
  private provider: IframeProvider | null = null;
  private address?: string;
  private type: IframeLoginTypes | null = null;
  private _signTransactions:
    | ((transactions: Transaction[]) => Promise<Transaction[]>)
    | null = null;
  private _signMessage: ((message: Message) => Promise<Message>) | null = null;
  private _login:
    | ((options?: {
        callbackUrl?: string;
        token?: string;
      }) => Promise<{ address: string; signature?: string }>)
    | null = null;
  private loginAbortController: AbortController | null = null;

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
    this._login = this.provider.login.bind(this.provider);

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
    provider.login = this.login;
    provider.cancelLogin = this.cancelLogin;

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

  private login = async (options?: {
    callbackUrl?: string;
    token?: string;
  }) => {
    if (!this.provider || !this._login) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    this.cancelLogin();

    try {
      const { address, signature } = await withAbortableLogin({
        loginAbortController: this.loginAbortController,
        setLoginAbortController: (controller) => {
          this.loginAbortController = controller;
        },
        loginOperation: () =>
          this._login?.(options) as Promise<{
            address: string;
            signature?: string;
          }>
      });

      this.loginAbortController = null;
      return { address, signature: signature ?? '' };
    } catch (error) {
      this.loginAbortController = null;
      throw error;
    }
  };

  public cancelLogin = () => {
    cancelLogin({
      loginAbortController: this.loginAbortController,
      resetLoginAbortController: () => {
        this.loginAbortController = null;
      },
      onAfterCancel: this.provider?.cancelAction?.bind(this.provider)
    });
  };

  private signTransactions = async (transactions: Transaction[]) => {
    if (!this.provider || !this._signTransactions) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const { eventBus, manager, onClose } = await getPendingTransactionsHandlers(
      {
        cancelAction: this.provider.cancelAction.bind(this.provider)
      }
    );

    eventBus.subscribe(
      PendingTransactionsEventsEnum.CLOSE_PENDING_TRANSACTIONS,
      onClose
    );

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
      await onClose({ shouldCancelAction: true });
      throw error;
    } finally {
      manager.closeAndReset();
      eventBus.unsubscribe(
        PendingTransactionsEventsEnum.CLOSE_PENDING_TRANSACTIONS,
        onClose
      );
    }
  };

  private signMessage = async (message: Message) => {
    if (!this.provider || !this._signMessage || !this.type) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const signedMessage = await signMessage({
      message,
      handleSignMessage: this._signMessage.bind(this.provider),
      cancelAction: this.provider.cancelAction.bind(this.provider),
      providerType: providerLabels[this.type]
    });

    return signedMessage;
  };
}
