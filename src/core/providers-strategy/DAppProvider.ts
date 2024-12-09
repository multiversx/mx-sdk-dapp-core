import { Message } from '@multiversx/sdk-core/out/message';
import { Transaction } from '@multiversx/sdk-core/out/transaction';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import { login as genericLogin } from 'core/providers-strategy/helpers/login/login';
import { logout as genericLogout } from 'core/providers-strategy/helpers/logout/logout';
import { signMessage as genericSignMessage } from 'core/providers-strategy/helpers/signMessage/signMessage';
import {
  verifyMessage as genericVerifyMessage,
  VerifyMessageReturnType
} from 'core/providers-strategy/helpers/signMessage/verifyMessage';
import {
  signTransactions as genericSignTransactions,
  SignTransactionsOptionsType
} from 'core/providers-strategy/helpers/signTransactions/signTransactions';
import { IProvider } from './models/Provider';

export class DAppProvider<TProvider extends IProvider> {
  constructor(
    private provider: TProvider,
    private providerType: ProviderTypeEnum,
    public address?: string
  ) {
    this.address = address || '';
  }

  public init() {
    return this.provider.init();
  }

  public async login() {
    return await genericLogin(this.provider);
  }

  public async logout(
    options = {
      shouldBroadcastLogoutAcrossTabs: true,
      hasConsentPopup: false
    }
  ) {
    return await genericLogout({ provider: this.provider, options });
  }

  public setShouldShowConsentPopup(shouldShow: boolean) {
    this.provider.setShouldShowConsentPopup?.(shouldShow);
  }

  public getType() {
    return this.providerType;
  }

  public getProvider() {
    return this.provider;
  }

  public async signTransactions(
    transactions: Transaction[],
    options?: SignTransactionsOptionsType
  ): Promise<Transaction[]> {
    const signedTransactions = await genericSignTransactions({
      provider: this.provider,
      transactions,
      options
    });
    return signedTransactions;
  }

  public async signMessage(
    message: Message,
    options?: {
      hasConsentPopup?: boolean;
    }
  ): Promise<Message | null> {
    const signedMessage = await genericSignMessage({
      provider: this.provider,
      message,
      options
    });
    return signedMessage;
  }

  public verifyMessage(signedMessage: string): VerifyMessageReturnType {
    return genericVerifyMessage(signedMessage);
  }
}
