import { isBrowserWithPopupConfirmation } from 'constants/browser.constants';
import {
  IProvider,
  ProviderTypeEnum
} from 'core/providers/types/providerFactory.types';
import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { networkSelector } from 'store/selectors/networkSelectors';
import { getState } from 'store/store';

export class CrossWindowProviderStrategy {
  private provider: CrossWindowProvider | null = null;
  private address: string = '';
  private walletAddress: string = '';

  constructor(
    address: string | undefined,
    walletAddress: string | undefined = ''
  ) {
    this.address = address || '';
    this.walletAddress = walletAddress;
  }

  public createProvider = async (): Promise<IProvider> => {
    this.createCrossWindowProvider();

    return this.buildProvider();
  };

  // Need to be used inside getGuardedTransactions
  public createCrossWindowProvider = async () => {
    const network = networkSelector(getState());

    if (!this.provider) {
      this.provider = CrossWindowProvider.getInstance();
      this.provider.init();
    }

    this.provider.setWalletUrl(this.walletAddress || network.walletAddress);
    this.provider.setAddress(this.address);

    if (isBrowserWithPopupConfirmation) {
      this.provider.setShouldShowConsentPopup(true);
    }

    return this.provider;
  };

  private buildProvider = () => {
    const provider = this.provider as unknown as IProvider;
    provider.getType = this.getType;

    return provider;
  };

  private getType = (): ProviderTypeEnum.crossWindow => {
    return ProviderTypeEnum.crossWindow;
  };
}
