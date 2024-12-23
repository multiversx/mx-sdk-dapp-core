import { Transaction } from '@multiversx/sdk-core/out';
import { IDAppProviderOptions } from '@multiversx/sdk-dapp-utils/out';
import { HWProvider, IProviderAccount } from '@multiversx/sdk-hw-provider';
import BigNumber from 'bignumber.js';
import { safeWindow } from 'constants/index';
import { LedgerConnectStateManager } from 'core/managers';
import { getAddress } from 'core/methods/account/getAddress';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import {
  IEventBus,
  IProvider,
  ProviderTypeEnum
} from 'core/providers/types/providerFactory.types';
import { defineCustomElements, LedgerConnectModal } from 'lib/sdkDappCoreUi';
import { setLedgerAccount } from 'store/actions';
import { setLedgerLogin } from 'store/actions/loginInfo/loginInfoActions';
import { ProviderErrorsEnum } from 'types';
import { fetchAccount } from 'utils/account/fetchAccount';
import { createModalElement } from 'utils/createModalElement';
import {
  getLedgerProvider,
  getLedgerErrorCodes,
  getAuthTokenText
} from './helpers';
import { ILedgerAccount, LedgerConnectEventsEnum } from './types';
import { signTransactions } from '../helpers/signTransactions/signTransactions';

const failInitializeErrorText = 'Check if the MultiversX App is open on Ledger';

export class LedgerProviderStrategy {
  private address: string = '';
  private provider: HWProvider | null = null;
  private manager: LedgerConnectStateManager<IEventBus> | null = null;
  private config: {
    version: string;
    dataEnabled: boolean;
  } | null = null;
  private eventBus: IEventBus | null = null;
  private _login:
    | ((options?: { addressIndex: number }) => Promise<IProviderAccount>)
    | null = null;
  private _signTransactions:
    | ((
        transactions: Transaction[],
        options?: IDAppProviderOptions
      ) => Promise<Transaction[]>)
    | null = null;

  constructor(address?: string) {
    this.address = address || '';
  }

  public createProvider = async (): Promise<IProvider> => {
    this.initialize();
    await defineCustomElements(safeWindow);

    const eventBus = await this.createEventBus();

    const manager = LedgerConnectStateManager.getInstance(eventBus);
    this.manager = manager;

    if (!this.provider) {
      const shouldInitiateLogin = !getIsLoggedIn();

      const { ledgerProvider, ledgerConfig } = await new Promise<
        Awaited<ReturnType<typeof getLedgerProvider>>
      >(async function buildLedgerProvider(resolve, reject) {
        const onRetry = () => buildLedgerProvider(resolve, reject);
        const onCancel = () => reject('Device unavailable');

        try {
          manager?.updateAccountScreen({
            isLoading: true
          });

          const data = await getLedgerProvider();

          eventBus?.unsubscribe(
            LedgerConnectEventsEnum.CONNECT_DEVICE,
            onRetry
          );
          eventBus?.unsubscribe(LedgerConnectEventsEnum.CLOSE, onCancel);

          resolve(data);
        } catch (err) {
          if (!shouldInitiateLogin) {
            throw err;
          }

          const { errorMessage, defaultErrorMessage } =
            getLedgerErrorCodes(err);
          manager?.updateConnectScreen({
            error:
              errorMessage ?? defaultErrorMessage ?? failInitializeErrorText
          });

          eventBus?.subscribe(LedgerConnectEventsEnum.CONNECT_DEVICE, onRetry);
          eventBus?.subscribe(LedgerConnectEventsEnum.CLOSE, onCancel);
        }
      });

      this.config = ledgerConfig;
      this.provider = ledgerProvider;
      this._login = ledgerProvider.login.bind(ledgerProvider);
      this._signTransactions =
        ledgerProvider.signTransactions.bind(ledgerProvider);
    }

    return this.buildProvider();
  };

  private buildProvider = async () => {
    if (!this.provider) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const provider = this.provider as unknown as IProvider;
    provider.setAccount({ address: this.address });
    provider.signTransactions = this.signTransactions;
    provider.login = this.login;

    await provider.init();
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

  private createEventBus = async () => {
    const shouldInitiateLogin = !getIsLoggedIn();

    if (!shouldInitiateLogin) {
      return;
    }

    const modalElement = await createModalElement<LedgerConnectModal>(
      'ledger-connect-modal'
    );
    const eventBus = await modalElement.getEventBus();

    if (!eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    this.eventBus = eventBus;
    return eventBus;
  };

  private signTransactions = async (transactions: Transaction[]) => {
    if (!this._signTransactions) {
      throw new Error('Sign transactions method is not initialized');
    }

    const signedTransactions = await signTransactions({
      transactions,
      handleSign: this._signTransactions
    });
    return signedTransactions;
  };

  private login = async (options?: {
    callbackUrl?: string;
    token?: string;
  }) => {
    if (!this.provider || !this.config) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const isConnected = this.provider.isConnected();

    if (!isConnected) {
      throw new Error('Ledger device is not connected');
    }

    const authData = getAuthTokenText({
      loginToken: options?.token,
      version: this.config.version
    });

    const updateAccounts = async () => {
      if (!this.manager || !this.provider) {
        throw new Error(ProviderErrorsEnum.notInitialized);
      }

      const startIndex = this.manager.getAccountScreenData()?.startIndex || 0;
      const allAccounts = this.manager.getAllAccounts();

      const hasData = allAccounts.some(
        ({ index, balance }) =>
          index === startIndex && new BigNumber(balance).isFinite()
      );

      const slicedAccounts = allAccounts.slice(
        startIndex,
        startIndex + this.manager.addressesPerPage
      );

      if (hasData) {
        return this.manager.updateAccountScreen({
          accounts: slicedAccounts,
          isLoading: false
        });
      }

      if (slicedAccounts.length === 0) {
        this.manager.updateAccountScreen({
          isLoading: true
        });
      }

      try {
        const accountsArray = await this.provider.getAccounts(
          startIndex,
          this.manager.addressesPerPage
        );

        const accountsWithBalance: ILedgerAccount[] = accountsArray.map(
          (address, index) => {
            return {
              address,
              balance: '...',
              index: index + startIndex
            };
          }
        );

        const newAllAccounts = [...allAccounts, ...accountsWithBalance];

        this.manager.updateAllAccounts(newAllAccounts);

        this.manager.updateAccountScreen({
          accounts: newAllAccounts.slice(
            startIndex,
            startIndex + this.manager.addressesPerPage
          ),
          isLoading: false
        });

        const balancePromises = accountsArray.map((address) =>
          fetchAccount(address)
        );

        const balances = await Promise.all(balancePromises);

        balances.forEach((account, index) => {
          const bNbalance = new BigNumber(String(account?.balance));
          if (!account || bNbalance.isNaN()) {
            return;
          }
          const balance = bNbalance
            .dividedBy(BigNumber(10).pow(18))
            .toFormat(4)
            .toString();
          const accountArrayIndex = index + startIndex;
          newAllAccounts[accountArrayIndex].balance = balance;
        });

        this.manager.updateAllAccounts(newAllAccounts);

        this.manager.updateAccountScreen({
          accounts: newAllAccounts.slice(
            startIndex,
            startIndex + this.manager.addressesPerPage
          )
        });
      } catch (error) {
        this.manager.updateAccountScreen({
          accounts: allAccounts.slice(
            startIndex,
            startIndex + this.manager.addressesPerPage
          ),
          isLoading: false
        });
        console.error('Failed to fetch accounts:', error);
      }
    };

    await updateAccounts();

    const selectedAccount = await new Promise<{
      address: string;
      signature: string;
      addressIndex: number;
    }>(async (resolve, reject) => {
      const unsubscribeFromEvents = () => {
        if (!this.eventBus) {
          throw new Error('Event bus not provided for Ledger provider');
        }
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        this.eventBus.unsubscribe(LedgerConnectEventsEnum.CLOSE, onCancel);
        this.eventBus.unsubscribe(
          LedgerConnectEventsEnum.NEXT_PAGE,
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          onNextPageChanged
        );
        this.eventBus.unsubscribe(
          LedgerConnectEventsEnum.PREV_PAGE,
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          onPrevPageChanged
        );
        this.eventBus.unsubscribe(
          LedgerConnectEventsEnum.ACCESS_WALLET,
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          onAccessWallet
        );
      };

      const closeComponent = () => {
        this.manager?.closeAndReset();
      };

      const onCancel = async () => {
        await updateAccounts();
        unsubscribeFromEvents();
        reject('User cancelled login');
      };

      const onNextPageChanged = async () => {
        const startIndex =
          this.manager?.getAccountScreenData()?.startIndex || 0;
        this.manager?.updateStartIndex(
          startIndex + this.manager.addressesPerPage
        );
        await updateAccounts();
      };

      const onPrevPageChanged = async () => {
        const startIndex =
          this.manager?.getAccountScreenData()?.startIndex || 0;

        if (startIndex > 0) {
          this.manager?.updateStartIndex(
            Math.max(0, startIndex - this.manager.addressesPerPage)
          );

          await updateAccounts();
        }
      };

      // Initialize here in order to have access inside function
      const manager = this.manager;
      const provider = this.provider;
      const login = this._login;

      const onAccessWallet = async function tryAccessWallet(payload: {
        addressIndex: number;
        selectedAddress: string;
      }) {
        if (!provider || !login) {
          return;
        }

        manager?.updateConfirmScreen({
          ...authData,
          selectedAddress: payload.selectedAddress
        });

        try {
          const loginInfo = options?.token
            ? await provider.tokenLogin({
                token: Buffer.from(`${options?.token}{}`),
                addressIndex: payload.addressIndex
              })
            : await login({
                addressIndex: payload.addressIndex
              });

          closeComponent();

          resolve({
            address: loginInfo.address,
            signature: loginInfo.signature
              ? loginInfo.signature.toString('hex')
              : '',
            addressIndex: payload.addressIndex
          });
        } catch (err) {
          console.error('User rejected login:', err);
          const shouldClose = Boolean(manager?.getAccountScreenData());
          if (shouldClose) {
            return closeComponent();
          }
          const shouldGoBack = Boolean(manager?.getConfirmScreenData());
          if (shouldGoBack) {
            await updateAccounts();
          }
        }
      };

      if (!this.eventBus) {
        throw new Error('Event bus not provided for Ledger provider');
      }

      this.eventBus.subscribe(LedgerConnectEventsEnum.CLOSE, onCancel);
      this.eventBus.subscribe(
        LedgerConnectEventsEnum.NEXT_PAGE,
        onNextPageChanged
      );
      this.eventBus.subscribe(
        LedgerConnectEventsEnum.PREV_PAGE,
        onPrevPageChanged
      );
      this.eventBus.subscribe(
        LedgerConnectEventsEnum.ACCESS_WALLET,
        onAccessWallet
      );
    });

    const { version, dataEnabled } = this.config;

    setLedgerLogin({
      index: selectedAccount.addressIndex,
      loginType: ProviderTypeEnum.ledger
    });

    setLedgerAccount({
      address: selectedAccount.address,
      index: selectedAccount.addressIndex,
      version,
      hasContractDataEnabled: dataEnabled
    });

    return {
      address: selectedAccount.address,
      signature: selectedAccount.signature
    };
  };
}
