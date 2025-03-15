import { Message, Transaction } from '@multiversx/sdk-core/out';
import { IDAppProviderOptions } from '@multiversx/sdk-dapp-utils/out';
import { HWProvider } from '@multiversx/sdk-hw-provider';
import { safeWindow } from 'constants/index';

import { UITagsEnum } from 'constants/UITags.enum';
import { LedgerConnectStateManager } from 'core/managers/internal/LedgerConnectStateManager/LedgerConnectStateManager';
import { getAddress } from 'core/methods/account/getAddress';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { IProvider } from 'core/providers/types/providerFactory.types';
import {
  defineCustomElements,
  LedgerConnect,
  LedgerConnectPanel
} from 'lib/sdkDappCoreUi';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement } from 'utils/createUIElement';
import { getLedgerProvider } from './helpers';
import { authenticateLedgerAccount } from './helpers/authenticateLedgerAccount';
import { initializeLedgerProvider } from './helpers/initializeLedgerProvider';
import { signLedgerMessage } from './helpers/signLedgerMessage';
import {
  LedgerConnectStateManagerType,
  LedgerConfigType,
  LedgerEventBusType,
  LedgerLoginType
} from './types/ledgerProvider.types';
import { signTransactions } from '../helpers/signTransactions/signTransactions';

export class LedgerProviderStrategy {
  private address: string = '';
  private provider: HWProvider | null = null;
  private manager: LedgerConnectStateManagerType | null = null;
  private config: LedgerConfigType | null = null;
  private eventBus: LedgerEventBusType | null = null;
  private _login: LedgerLoginType | null = null;
  private _signTransactions:
    | ((
        transactions: Transaction[],
        options?: IDAppProviderOptions
      ) => Promise<Transaction[]>)
    | null = null;
  private _signMessage: ((message: Message) => Promise<Message>) | null = null;

  constructor(address?: string) {
    this.address = address || '';
  }

  public createProvider = async (options?: {
    anchor?: HTMLElement;
  }): Promise<IProvider> => {
    this.initialize();
    await defineCustomElements(safeWindow);

    const eventBus = await this.createEventBus(options?.anchor);

    if (eventBus) {
      this.manager = new LedgerConnectStateManager(eventBus);
    }

    if (!this.provider) {
      const { ledgerProvider, ledgerConfig } = await new Promise<
        Awaited<ReturnType<typeof getLedgerProvider>>
      >((resolve, reject) =>
        initializeLedgerProvider({
          eventBus,
          manager: this.manager,
          resolve,
          reject
        })
      );

      this.config = ledgerConfig;
      this.provider = ledgerProvider;
      this._login = ledgerProvider.login.bind(ledgerProvider);
      this._signTransactions =
        ledgerProvider.signTransactions.bind(ledgerProvider);

      this._signMessage = ledgerProvider.signMessage.bind(ledgerProvider);
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
    provider.signMessage = this.signMessage;

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

  private createEventBus = async (anchor?: HTMLElement) => {
    const shouldInitiateLogin = !getIsLoggedIn();

    if (!shouldInitiateLogin) {
      return;
    }

    const element = anchor
      ? await createUIElement<LedgerConnect>({
          name: UITagsEnum.LEDGER_CONNECT,
          anchor
        })
      : await createUIElement<LedgerConnectPanel>({
          name: UITagsEnum.LEDGER_CONNECT_PANEL
        });
    const eventBus = await element.getEventBus();

    if (!eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    this.eventBus = eventBus;
    return eventBus;
  };

  private signTransactions = async (transactions: Transaction[]) => {
    if (!this._signTransactions) {
      throw new Error(ProviderErrorsEnum.signTransactionsNotInitialized);
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

    const { address, signature } = await authenticateLedgerAccount({
      options,
      config: this.config,
      manager: this.manager,
      provider: this.provider,
      eventBus: this.eventBus,
      login: this._login
    });

    return {
      address,
      signature
    };
  };

  private signMessage = async (message: Message): Promise<Message> => {
    if (!this.provider || !this._signMessage) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const signedMessage = await signLedgerMessage({
      message,
      handleSignMessage: this._signMessage.bind(this.provider)
    });

    return signedMessage;
  };
}
