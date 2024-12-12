import { Message, Transaction } from '@multiversx/sdk-core/out';
import { isBrowserWithPopupConfirmation } from 'constants/browser.constants';
import { getAccount } from 'core/methods/account/getAccount';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';
import { ProviderError } from 'types';

export class CrossWindowProviderStrategy {
  private provider: CrossWindowProvider | null = null;
  private address: string = '';
  private walletAddress: string = '';
  private cwSignTransactions:
    | ((transactions: Transaction[]) => Promise<Transaction[]>)
    | null = null;
  private cwSignMessage: ((messageToSign: Message) => Promise<Message>) | null =
    null;

  constructor(
    address: string | undefined,
    walletAddress: string | undefined = ''
  ) {
    this.address = address || '';
    this.walletAddress = walletAddress;
  }

  public createProvider = async (): Promise<IProvider> => {
    const network = networkSelector(getState());

    if (!this.provider) {
      this.provider = CrossWindowProvider.getInstance();
      this.provider.init();
    }

    // Bind in order to break reference
    this.cwSignTransactions = this.provider.signTransactions.bind(
      this.provider
    );
    this.cwSignMessage = this.provider.signMessage.bind(this.provider);

    this.provider.setWalletUrl(this.walletAddress || network.walletAddress);
    this.provider.setAddress(this.address);

    this.setPopupConsent();

    return this.buildProvider();
  };

  private buildProvider = () => {
    if (!this.provider) {
      throw new Error(ProviderError.notInitialized);
    }

    const provider = this.provider as unknown as IProvider;
    provider.signTransactions = this.signTransactions;
    provider.signMessage = this.signMessage;

    return provider;
  };

  private signTransactions = async (transactions: Transaction[]) => {
    if (!this.provider || !this.cwSignTransactions) {
      throw new Error(ProviderError.notInitialized);
    }

    this.setPopupConsent();

    const signedTransactions: Transaction[] =
      (await this.cwSignTransactions(transactions)) ?? [];

    // Guarded Transactions or Signed Transactions
    return this.getTransactions(signedTransactions);
  };

  private signMessage = async (message: Message) => {
    if (!this.provider || !this.cwSignMessage) {
      throw new Error(ProviderError.notInitialized);
    }

    this.setPopupConsent();
    return this.cwSignMessage(message);
  };

  private setPopupConsent = () => {
    if (!this.provider) {
      throw new Error(ProviderError.notInitialized);
    }

    if (!isBrowserWithPopupConfirmation) {
      return;
    }

    this.provider.setShouldShowConsentPopup(true);
  };

  private getTransactions = async (transactions: Transaction[]) => {
    if (!this.provider) {
      throw new Error(ProviderError.notInitialized);
    }

    const { isGuarded } = getAccount();

    const allSignedByGuardian = this.getAreAllTransactionsSignedByGuardian({
      isGuarded,
      transactions
    });

    if (!isGuarded || allSignedByGuardian) {
      return transactions;
    }

    const guardedTransactions =
      await this.provider.guardTransactions(transactions);

    return guardedTransactions;
  };

  private getAreAllTransactionsSignedByGuardian = ({
    transactions,
    isGuarded
  }: {
    transactions: Transaction[];
    isGuarded?: boolean;
  }) => {
    if (!isGuarded) {
      return true;
    }

    if (transactions.length === 0) {
      return false;
    }

    return transactions.every((tx) =>
      Boolean(tx.getGuardianSignature().toString('hex'))
    );
  };
}
