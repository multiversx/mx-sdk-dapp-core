import { Message, Transaction } from '@multiversx/sdk-core/out';
import { isBrowserWithPopupConfirmation } from 'constants/browser.constants';
import { PendingTransactionsEventsEnum } from 'core/managers/internal/PendingTransactionsStateManager/types/pendingTransactions.types';
import { getAddress } from 'core/methods/account/getAddress';
import {
  IProvider,
  providerLabels
} from 'core/providers/types/providerFactory.types';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { crossWindowConfigSelector } from 'store/selectors';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';
import { ProviderErrorsEnum } from 'types/provider.types';
import { getPendingTransactionsHandlers } from '../helpers/getPendingTransactionsHandlers';
import { signMessage } from '../helpers/signMessage/signMessage';
import { guardTransactions } from '../helpers/signTransactions/helpers/guardTransactions/guardTransactions';

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
  private _login:
    | ((options?: {
        callbackUrl?: string;
        token?: string;
      }) => Promise<{ address: string; signature?: string }>)
    | null = null;
  private loginAbortController: AbortController | null = null;

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

    this._signTransactions = this.provider.signTransactions.bind(this.provider);
    this._signMessage = this.provider.signMessage.bind(this.provider);
    this._login = this.provider.login.bind(this.provider);

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

  private signTransactions = async (transactions: Transaction[]) => {
    if (!this.provider || !this._signTransactions) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const { eventBus, onClose, manager } = await getPendingTransactionsHandlers(
      {
        cancelAction: this.provider.cancelAction.bind(this.provider)
      }
    );

    eventBus.subscribe(
      PendingTransactionsEventsEnum.CLOSE_PENDING_TRANSACTIONS,
      onClose
    );

    manager.openPendingTransactions({
      isPending: true,
      title: 'Confirm on MultiversX Web Wallet',
      subtitle: 'Check your MultiversX Web Wallet to sign the transaction'
    });

    this.setPopupConsent();

    try {
      const signedTransactions: Transaction[] =
        (await this._signTransactions(transactions)) ?? [];

      const optionallyGuardedTransactions =
        await guardTransactions(signedTransactions);

      return optionallyGuardedTransactions;
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
    if (!this.provider || !this._signMessage) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    this.setPopupConsent();

    const signedMessage = await signMessage({
      message,
      handleSignMessage: this._signMessage.bind(this.provider),
      cancelAction: this.provider.cancelAction.bind(this.provider),
      providerType: providerLabels.crossWindow
    });

    return signedMessage;
  };

  private login = async (options?: {
    callbackUrl?: string;
    token?: string;
  }) => {
    if (!this.provider || !this._login) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    this.cancelLogin();

    this.loginAbortController = new AbortController();
    const signal = this.loginAbortController.signal;

    try {
      const loginPromise = this._login(options);

      const abortPromise = new Promise<never>((_, reject) => {
        signal.addEventListener('abort', () => {
          reject(new Error('Login cancelled'));
        });
      });

      const { address, signature } = await Promise.race([
        loginPromise,
        abortPromise
      ]);

      this.loginAbortController = null;
      return { address, signature: signature ?? '' };
    } catch (error) {
      this.loginAbortController = null;
      throw error;
    }
  };

  public cancelLogin = () => {
    if (this.loginAbortController) {
      this.loginAbortController.abort();
      this.loginAbortController = null;
    }

    if (this.provider && this.provider.cancelAction) {
      this.provider.cancelAction();
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
}
