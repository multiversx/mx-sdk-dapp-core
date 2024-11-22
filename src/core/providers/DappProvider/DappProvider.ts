import { Transaction } from '@multiversx/sdk-core/out/transaction';
import { IProvider } from '../types/providerFactory.types';
import { login } from './helpers/login/login';
import { logout } from './helpers/logout/logout';
import {
  signTransactions,
  SignTransactionsOptionsType
} from './helpers/signTransactions/signTransactions';
import { Message } from '@multiversx/sdk-core/out/message';
import { signMessage } from './helpers/signMessage/signMessage';

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

  async signTransactions(
    transactions: Transaction[],
    options?: SignTransactionsOptionsType
  ): Promise<Transaction[]> {
    const signedTransactions = await signTransactions({
      provider: this.provider,
      transactions,
      options
    });
    return signedTransactions;
  }

  async signMessage(
    message: Message,
    options?: {
      hasConsentPopup?: boolean;
    }
  ): Promise<Message | null> {
    const signedMessage = await signMessage({
      provider: this.provider,
      message,
      options
    });
    return signedMessage;
  }
}
