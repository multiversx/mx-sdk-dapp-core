import { UITagsEnum } from 'constants/UITags.enum';

import {
  IAccountScreenData,
  IConfirmScreenData,
  IConnectScreenData,
  ILedgerAccount,
  ILedgerConnectPanelData,
  LedgerConnectPanel,
  IEventBus,
  LedgerConnect
} from 'lib/sdkDappCoreUi';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement } from 'utils/createUIElement';
import { LedgerConnectEventsEnum } from './types';

export class LedgerConnectStateManager {
  private static instance: LedgerConnectStateManager;
  private eventBus: IEventBus | null = null;
  private ledgerConnectElement: LedgerConnectPanel | null = null;
  private isCreatingElement = false;
  private isOpen = false;
  private anchor?: HTMLElement;
  public readonly addressesPerPage = 10;

  private allAccounts: ILedgerAccount[] = [];

  // first screen data
  private initialConnectScreenData: IConnectScreenData = {};
  private connectScreenData: IConnectScreenData = {
    ...this.initialConnectScreenData
  };

  // second screen data
  private initialAccountScreenData: IAccountScreenData = {
    accounts: this.allAccounts,
    startIndex: 0,
    addressesPerPage: this.addressesPerPage,
    isLoading: true
  };
  private accountScreenData: IAccountScreenData = {
    ...this.initialAccountScreenData
  };

  // third screen data
  private initialConfirmScreenData: IConfirmScreenData = {
    selectedAddress: ''
  };
  private confirmScreenData: IConfirmScreenData = {
    ...this.initialConfirmScreenData
  };

  // whole data to be sent on update events
  private initialData: ILedgerConnectPanelData = {
    connectScreenData: this.initialConnectScreenData,
    accountScreenData: null,
    confirmScreenData: null
  };

  private data: ILedgerConnectPanelData = { ...this.initialData };

  public static getInstance(): LedgerConnectStateManager {
    if (!LedgerConnectStateManager.instance) {
      LedgerConnectStateManager.instance = new LedgerConnectStateManager();
    }
    return LedgerConnectStateManager.instance;
  }

  private constructor() {}

  public async init(anchor?: HTMLElement) {
    this.anchor = anchor;
    await this.createLedgerConnectElement(anchor);
    await this.getEventBus();
    await this.setupEventListeners();
  }

  public async openLedgerConnect(
    data: ILedgerConnectPanelData = this.initialData
  ) {
    if (this.isOpen && this.ledgerConnectElement) {
      return;
    }

    if (!this.ledgerConnectElement) {
      await this.createLedgerConnectElement();
    }

    if (!this.ledgerConnectElement || !this.eventBus) {
      return;
    }

    this.data = { ...this.initialData, ...data };
    this.isOpen = true;

    this.publishEvent(LedgerConnectEventsEnum.OPEN_LEDGER_CONNECT_PANEL);
    this.notifyDataUpdate();
  }

  private publishEvent(event: string, data?: ILedgerConnectPanelData) {
    if (!this.eventBus) {
      return;
    }

    this.eventBus.publish(event, data || this.data);
  }

  public updateAllAccounts(accounts: ILedgerAccount[]): void {
    this.allAccounts = accounts;
    this.accountScreenData.accounts = accounts;
  }

  public updateStartIndex(startIndex: number): void {
    this.accountScreenData.startIndex = startIndex;
  }

  private resetData(): void {
    this.accountScreenData = { ...this.initialAccountScreenData };
    this.confirmScreenData = { ...this.initialConfirmScreenData };
    this.connectScreenData = { ...this.initialConnectScreenData };
    this.data = { ...this.initialData };
  }

  public closeAndReset(): void {
    if (!this.eventBus || !this.isOpen) {
      return;
    }

    this.data.shouldClose = true;
    this.notifyDataUpdate();
    this.resetData();
    this.isOpen = false;

    this.publishEvent(LedgerConnectEventsEnum.CLOSE_LEDGER_CONNECT_PANEL);
  }

  public updateConnectScreen(members: Partial<IConnectScreenData>): void {
    this.connectScreenData = {
      ...this.connectScreenData,
      ...members
    };
    this.data.confirmScreenData = null;
    this.data.accountScreenData = null;
    this.data.connectScreenData = this.connectScreenData;
    this.notifyDataUpdate();
  }

  public updateAccountScreen(members: Partial<IAccountScreenData>): void {
    this.accountScreenData = {
      ...this.accountScreenData,
      ...members
    };
    this.data.confirmScreenData = null;
    this.data.accountScreenData = this.accountScreenData;
    this.notifyDataUpdate();
  }

  public updateConfirmScreen(members: Partial<IConfirmScreenData>): void {
    this.confirmScreenData = {
      ...this.confirmScreenData,
      ...members
    };
    this.data.accountScreenData = null;
    this.data.confirmScreenData = this.confirmScreenData;
    this.notifyDataUpdate();
  }

  private notifyDataUpdate(): void {
    if (!this.eventBus) {
      return;
    }

    this.publishEvent(LedgerConnectEventsEnum.DATA_UPDATE, this.data);
  }

  public getAccountScreenData(): IAccountScreenData | null {
    return this.data.accountScreenData;
  }

  public getConfirmScreenData(): IConfirmScreenData | null {
    return this.data.confirmScreenData;
  }

  public getAllAccounts(): ILedgerAccount[] {
    return this.allAccounts;
  }

  public async getEventBus(): Promise<IEventBus | null> {
    if (!this.ledgerConnectElement) {
      await this.createLedgerConnectElement();
    }

    if (!this.ledgerConnectElement) {
      return null;
    }

    if (!this.eventBus) {
      this.eventBus = await this.ledgerConnectElement.getEventBus();
    }

    if (!this.eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    return this.eventBus;
  }

  public async createLedgerConnectElement(
    anchor: HTMLElement | undefined = this.anchor
  ): Promise<LedgerConnectPanel | null> {
    if (this.ledgerConnectElement) {
      return this.ledgerConnectElement;
    }

    if (!this.isCreatingElement) {
      this.isCreatingElement = true;
      const element = anchor
        ? await createUIElement<LedgerConnect>({
            name: UITagsEnum.LEDGER_CONNECT,
            anchor
          })
        : await createUIElement<LedgerConnectPanel>({
            name: UITagsEnum.LEDGER_CONNECT_PANEL
          });

      this.ledgerConnectElement = element || null;
      await this.getEventBus();
      this.isCreatingElement = false;
    }

    if (!this.ledgerConnectElement) {
      throw new Error('Failed to create ledger connect element');
    }

    return this.ledgerConnectElement;
  }

  private async setupEventListeners() {
    if (!this.ledgerConnectElement) {
      await this.createLedgerConnectElement();
    }

    if (!this.eventBus) {
      return;
    }

    this.eventBus.subscribe(
      LedgerConnectEventsEnum.CLOSE_LEDGER_CONNECT_PANEL,
      this.handleCloseLedgerConnect.bind(this)
    );
  }

  private handleCloseLedgerConnect() {
    this.isOpen = false;
    this.resetData();
  }

  public subscribeToProviderInit(
    onRetry: () => void,
    onCancel: () => void
  ): void {
    if (!this.eventBus) {
      return;
    }

    this.eventBus.subscribe(LedgerConnectEventsEnum.CONNECT_DEVICE, onRetry);
    this.eventBus.subscribe(
      LedgerConnectEventsEnum.CLOSE_LEDGER_CONNECT_PANEL,
      onCancel
    );
  }

  public unsubscribeFromProviderInit(
    onRetry: () => void,
    onCancel: () => void
  ): void {
    if (!this.eventBus) {
      return;
    }

    this.eventBus.unsubscribe(LedgerConnectEventsEnum.CONNECT_DEVICE, onRetry);
    this.eventBus.unsubscribe(
      LedgerConnectEventsEnum.CLOSE_LEDGER_CONNECT_PANEL,
      onCancel
    );
  }

  public destroy() {
    if (this.eventBus) {
      this.eventBus.unsubscribe(
        LedgerConnectEventsEnum.CLOSE_LEDGER_CONNECT_PANEL,
        this.handleCloseLedgerConnect.bind(this)
      );

      this.eventBus = null;
    }

    if (this.ledgerConnectElement) {
      const parentElement = this.ledgerConnectElement.parentElement;

      if (parentElement) {
        parentElement.removeChild(this.ledgerConnectElement);
      }

      this.ledgerConnectElement = null;
    }

    this.isOpen = false;
  }
}
