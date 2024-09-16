import { CrossWindowProvider } from 'lib/sdkWebWalletCrossWindowProvider';
import { ExtensionProvider } from '@multiversx/sdk-extension-provider';
import {
  IProvider,
  IProviderConfig,
  IProviderFactory,
  ProviderTypeEnum
} from './types/providerFactory.types';
import { isBrowserWithPopupConfirmation } from '../../constants';
import { HWProvider } from '@multiversx/sdk-hw-provider/out';
import { fetchAccount } from 'utils';
import { setLedgerLogin } from 'store/actions/loginInfo/loginInfoActions';
import { getLedgerConfiguration } from './helpers/getLedgerConfiguration';
import { setLedgerAccount } from 'store/actions/account/accountActions';

export class ProviderFactory {
  public async create({
    type,
    config,
    customProvider
  }: IProviderFactory): Promise<IProvider | undefined> {
    let createdProvider: IProvider | undefined;

    switch (type) {
      case ProviderTypeEnum.extension: {
        const provider = await this.getExtensionProvider();
        createdProvider = provider as unknown as IProvider;

        createdProvider.getAddress = () => {
          return Promise.resolve(provider.account.address);
        };

        createdProvider.getTokenLoginSignature = () => {
          return provider.account.signature;
        };

        createdProvider.getType = () => {
          return ProviderTypeEnum.extension;
        };

        break;
      }

      case ProviderTypeEnum.crossWindow: {
        const { walletAddress } = config.network;

        const provider = await this.getCrossWindowProvider({
          walletAddress,
          address: config.account?.address || ''
        });
        createdProvider = provider as unknown as IProvider;

        createdProvider.getType = () => {
          return ProviderTypeEnum.crossWindow;
        };

        break;
      }

      case ProviderTypeEnum.ledger: {
        const provider = await this.getLedgerProvider();

        createdProvider = provider as unknown as IProvider;

        const hwProviderLogin = provider.login;

        createdProvider.getType = () => {
          return ProviderTypeEnum.ledger;
        };

        createdProvider.login = async (options?: {
          callbackUrl?: string | undefined;
          token?: string | undefined;
        }) => {
          await provider.isConnected();

          // TODO: perform additional UI logic here
          // maybe extract to file
          const startIndex = 0;
          const addressesPerPage = 10;

          const accounts = await provider.getAccounts(
            startIndex,
            addressesPerPage
          );

          const accountsWithBalance: {
            address: string;
            balance: string;
            index: number;
          }[] = [];

          const balancePromises = accounts.map((address) =>
            fetchAccount(address)
          );

          await Promise.all(balancePromises).then((balances) => {
            balances.forEach((account, index) => {
              if (!account) {
                return;
              }
              accountsWithBalance.push({
                address: account.address,
                balance: account.balance,
                index
              });
            });
          });

          // Suppose user selects the first account
          const selectedIndex = 0;

          setLedgerLogin({
            index: selectedIndex,
            loginType: ProviderTypeEnum.ledger
          });

          const { version, dataEnabled } =
            await getLedgerConfiguration(provider);

          setLedgerAccount({
            address: accountsWithBalance[selectedIndex].address,
            index: selectedIndex,
            version,
            hasContractDataEnabled: dataEnabled
          });

          if (options?.token) {
            const loginInfo = await provider.tokenLogin({
              token: Buffer.from(`${options?.token}{}`),
              addressIndex: accountsWithBalance[selectedIndex].index
            });

            return {
              address: loginInfo.address,
              signature: loginInfo.signature.toString('hex')
            };
          } else {
            const address = await hwProviderLogin({
              addressIndex: accountsWithBalance[selectedIndex].index
            });
            return {
              address,
              signature: ''
            };
          }
        };

        break;
      }

      case ProviderTypeEnum.custom: {
        createdProvider = customProvider;
        break;
      }

      default:
        break;
    }

    return createdProvider;
  }

  private async getCrossWindowProvider({
    address,
    walletAddress
  }: {
    address: string;
    walletAddress: string;
  }) {
    const provider = CrossWindowProvider.getInstance();
    await provider.init();
    provider.setWalletUrl(String(walletAddress));
    provider.setAddress(address);

    if (isBrowserWithPopupConfirmation) {
      provider.setShouldShowConsentPopup(true);
    }

    return provider;
  }

  private async getExtensionProvider() {
    const provider = ExtensionProvider.getInstance();
    await provider.init();
    return provider;
  }

  private async getLedgerProvider() {
    const provider = new HWProvider();
    await provider.init();
    return provider;
  }
}
