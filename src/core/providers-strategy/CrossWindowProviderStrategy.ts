import { Message, Transaction } from '@multiversx/sdk-core/out';
import { isBrowserWithPopupConfirmation } from 'constants/browser.constants';
import { getAccount } from 'core/methods/account/getAccount';
import { IProvider } from 'core/providers/types/providerFactory.types';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';
import { ProviderErrorsEnum } from 'types';

export class CrossWindowProviderStrategy {
  private provider: CrossWindowProvider | null = null;
  private address: string = '';
  private walletAddress: string = '';
  private _signTransactions:
    | ((transactions: Transaction[]) => Promise<Transaction[]>)
    | null = null;
  private _signMessage: ((messageToSign: Message) => Promise<Message>) | null =
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
    this._signTransactions = this.provider.signTransactions.bind(this.provider);
    this._signMessage = this.provider.signMessage.bind(this.provider);

    this.provider.setWalletUrl(this.walletAddress || network.walletAddress);
    this.provider.setAddress(this.address);

    this.setPopupConsent();

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

  private signTransactions = async (transactions: Transaction[]) => {
    if (!this.provider || !this._signTransactions) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    this.setPopupConsent();

    const signedTransactions: Transaction[] =
      (await this._signTransactions(transactions)) ?? [];

    // Guarded Transactions or Signed Transactions
    return this.getTransactions(signedTransactions);
  };

  private signMessage = async (message: Message) => {
    if (!this.provider || !this._signMessage) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    this.setPopupConsent();
    return this._signMessage(message);
  };

  private setPopupConsent = () => {
    if (!this.provider) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    if (!isBrowserWithPopupConfirmation) {
      return;
    }

    this.provider.setShouldShowConsentPopup(true);
  };

  private getTransactions = async (transactions: Transaction[]) => {
    if (!this.provider) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const { isGuarded } = getAccount();

    const allSignedByGuardian = this.getAreAllTransactionsSignedByGuardian({
      isGuarded,
      transactions
    });

    const needs2FAsigning = isGuarded && !allSignedByGuardian;

    if (needs2FAsigning) {
      const guardedTransactions =
        await this.provider.guardTransactions(transactions);

      return guardedTransactions;
    }

    return transactions;
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
