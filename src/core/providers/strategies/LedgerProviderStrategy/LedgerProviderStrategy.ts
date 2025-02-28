import { Message, Transaction } from '@multiversx/sdk-core/out';
import { IDAppProviderOptions } from '@multiversx/sdk-dapp-utils/out';
import { HWProvider } from '@multiversx/sdk-hw-provider';
import { safeWindow } from 'constants/index';

import { LedgerConnectStateManager } from 'core/managers/internal/LedgerConnectStateManager/LedgerConnectStateManager';
import { PendingTransactionsEventsEnum } from 'core/managers/internal/PendingTransactionsStateManager/types/pendingTransactions.types';
import { getAddress } from 'core/methods/account/getAddress';
import { getIsLoggedIn } from 'core/methods/account/getIsLoggedIn';
import { IProvider } from 'core/providers/types/providerFactory.types';
import {
  defineCustomElements,
  LedgerConnect,
  LedgerConnectModal,
  PendingTransactionsModal
} from 'lib/sdkDappCoreUi';
import { SigningWarningsEnum } from 'types/enums.types';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement } from 'utils/createUIElement';
import { getLedgerProvider } from './helpers';
import { authenticateLedgerAccount } from './helpers/authenticateLedgerAccount';
import { initializeLedgerProvider } from './helpers/initializeLedgerProvider';
import {
  LedgerConnectStateManagerType,
  LedgerConfigType,
  LedgerEventBusType,
  LedgerLoginType
} from './types/ledgerProvider.types';
import { getModalHandlers } from '../helpers/getModalHandlers';
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
          name: 'ledger-connect',
          anchor
        })
      : await createUIElement<LedgerConnectModal>({
          name: 'ledger-connect-modal'
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
    const msg = await new Promise<Awaited<Message>>(async (resolve, reject) => {
      if (!this.provider || !this._signMessage) {
        return reject(ProviderErrorsEnum.notInitialized);
      }

      // TODO: extract this to a separate method for all providers
      const modalElement = await createUIElement<PendingTransactionsModal>({
        name: 'pending-transactions-modal'
      });

      const { eventBus, manager, onClose } = await getModalHandlers({
        modalElement
      });

      const closeModal = () => {
        onClose();
        reject({ message: SigningWarningsEnum.cancelled });
      };

      eventBus.subscribe(PendingTransactionsEventsEnum.CLOSE, closeModal);

      manager.updateData({
        isPending: true,
        title: 'Message Signing',
        subtitle: 'Check your Ledger device to sign the message'
      });

      try {
        const signedMessage = await this._signMessage(message);

        resolve(signedMessage);
      } catch (err) {
        reject(err);
      } finally {
        onClose();
        eventBus.unsubscribe(PendingTransactionsEventsEnum.CLOSE, closeModal);
      }
    });
    return msg;
  };
}
