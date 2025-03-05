import { Message } from '@multiversx/sdk-core/out/message';
import { Transaction } from '@multiversx/sdk-core/out/transaction';
import { IProvider } from '../types/providerFactory.types';
import { login } from './helpers/login/login';
import { logout } from './helpers/logout/logout';
import { handleSignError } from './helpers/signErrors/handleSignError';
import { signMessageWithProvider } from './helpers/signMessage/signMessageWithProvider';
import {
  verifyMessage,
  VerifyMessageReturnType
} from './helpers/signMessage/verifyMessage';
import {
  signTransactionsWithProvider,
  SignTransactionsOptionsType
} from './helpers/signTransactions/signTransactionsWithProvider';

export class DappProvider {
  private provider: IProvider;

  constructor(provider: IProvider) {
    this.provider = provider;
  }

  init() {
    return this.provider.init();
  }

  async login() {
    return await login(this.provider);
  }

  async logout(
    options = {
      shouldBroadcastLogoutAcrossTabs: true,
      hasConsentPopup: false
    }
  ) {
    return await logout({ provider: this.provider, options });
  }

  setShouldShowConsentPopup(shouldShow: boolean) {
    this.provider.setShouldShowConsentPopup?.(shouldShow);
  }

  getType() {
    return this.provider.getType();
  }

  getProvider() {
    return this.provider;
  }

  async signTransactions(
    transactions: Transaction[],
    options?: SignTransactionsOptionsType
  ): Promise<Transaction[]> {
    try {
      const signedTransactions = await signTransactionsWithProvider({
        provider: this.provider,
        transactions,
        options
      });
      return signedTransactions;
    } catch (error) {
      const errorMessage = handleSignError(error);
      throw new Error(errorMessage);
    }
  }

  async signMessage(
    message: Message,
    options?: {
      hasConsentPopup?: boolean;
    }
  ): Promise<Message | null> {
    try {
      const signedMessage = await signMessageWithProvider({
        provider: this.provider,
        message,
        options
      });
      return signedMessage;
    } catch (error) {
      const errorMessage = handleSignError(error, 'warning');
      throw new Error(errorMessage);
    }
  }

  verifyMessage(signedMessage: string): VerifyMessageReturnType {
    return verifyMessage(signedMessage);
  }
}
