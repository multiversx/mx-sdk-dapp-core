import { Message } from '@multiversx/sdk-core/out/message';
import { Transaction } from '@multiversx/sdk-core/out/transaction';
import { IProvider } from './models/Provider';
import { VerifyMessageReturnType } from '../providers/DappProvider/helpers/signMessage/verifyMessage';
import { SignTransactionsOptionsType } from '../providers/DappProvider/helpers/signTransactions/signTransactions';

export class ProviderContainer<TProvider extends IProvider> {
  constructor(
    private provider: TProvider,
    public address?: string
  ) {
    this.address = address || '';
  }

  init() {
    return this.provider.init();
  }

  async login() {
    throw new Error('Method not implemented');
  }

  async logout(
    options = {
      shouldBroadcastLogoutAcrossTabs: true,
      hasConsentPopup: false
    }
  ) {
    console.log('logoutOptions', options);
    throw new Error('Method not implemented');
  }

  setShouldShowConsentPopup(shouldShow: boolean) {
    this.provider.setShouldShowConsentPopup?.(shouldShow);
  }

  async signTransactions(
    transactions: Transaction[],
    options?: SignTransactionsOptionsType
  ): Promise<Transaction[]> {
    console.log('signTransactions', transactions, options);
    throw new Error('Method not implemented');
  }

  async signMessage(
    message: Message,
    options?: {
      hasConsentPopup?: boolean;
    }
  ): Promise<Message | null> {
    console.log('signMessage', message, options);
    throw new Error('Method not implemented');
  }

  verifyMessage(signedMessage: string): VerifyMessageReturnType {
    console.log('verifyMessage', signedMessage);
    throw new Error('Method not implemented');
  }
}
