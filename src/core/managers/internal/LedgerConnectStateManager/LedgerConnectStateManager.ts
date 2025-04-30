import { UITagsEnum } from 'constants/UITags.enum';

import {
  IAccountScreenData,
  ILedgerAccount,
  ILedgerConnectPanelData,
  IConnectScreenData,
  IConfirmScreenData
} from 'core/providers/strategies/LedgerProviderStrategy/types/ledger.types';
import { MvxLedgerFlow } from 'lib/sdkDappCoreUi';
import { LedgerConnectEventsEnum } from './types';
import { SidePanelBaseManager } from '../SidePanelBaseManager/SidePanelBaseManager';

export class LedgerConnectStateManager extends SidePanelBaseManager<
  MvxLedgerFlow,
  ILedgerConnectPanelData,
  LedgerConnectEventsEnum
> {
  private static instance: LedgerConnectStateManager;

  public static getInstance(): LedgerConnectStateManager {
    if (!LedgerConnectStateManager.instance) {
      LedgerConnectStateManager.instance = new LedgerConnectStateManager();
    }
    return LedgerConnectStateManager.instance;
  }

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
    selectedAddress: '',
    addressExplorerLink: ''
  };

  private confirmScreenData: IConfirmScreenData = {
    ...this.initialConfirmScreenData
  };

  protected initialData: ILedgerConnectPanelData = {
    connectScreenData: this.initialConnectScreenData,
    accountScreenData: this.initialAccountScreenData,
    confirmScreenData: this.initialConfirmScreenData
  };

  constructor() {
    super('ledger-connect');
    this.data = this.getInitialData();
  }

  public async openLedgerConnect(
    data: ILedgerConnectPanelData = this.initialData
  ) {
    await this.openUI(data);
  }

  public updateAllAccounts(accounts: ILedgerAccount[]): void {
    this.allAccounts = accounts;
    this.accountScreenData.accounts = accounts;
  }

  public updateStartIndex(startIndex: number): void {
    this.accountScreenData.startIndex = startIndex;
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

  public getAccountScreenData(): IAccountScreenData | null {
    return this.data.accountScreenData;
  }

  public getConfirmScreenData(): IConfirmScreenData | null {
    return this.data.confirmScreenData;
  }

  public getAllAccounts(): ILedgerAccount[] {
    return this.allAccounts;
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
    this.eventBus.subscribe(
      LedgerConnectEventsEnum.UI_DISCONNECTED,
      this.destroy.bind(this)
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
    this.eventBus.unsubscribe(
      LedgerConnectEventsEnum.UI_DISCONNECTED,
      this.destroy.bind(this)
    );
  }

  protected resetData(): void {
    this.accountScreenData = { ...this.initialAccountScreenData };
    this.confirmScreenData = { ...this.initialConfirmScreenData };
    this.connectScreenData = { ...this.initialConnectScreenData };
    super.resetData();
  }

  protected getUIElementName(): UITagsEnum {
    return this.anchor
      ? UITagsEnum.LEDGER_FLOW
      : UITagsEnum.LEDGER_CONNECT_PANEL;
  }

  protected getOpenEventName(): LedgerConnectEventsEnum {
    return LedgerConnectEventsEnum.OPEN_LEDGER_CONNECT_PANEL;
  }

  protected getCloseEventName(): LedgerConnectEventsEnum {
    return LedgerConnectEventsEnum.CLOSE_LEDGER_CONNECT_PANEL;
  }

  protected getDataUpdateEventName(): LedgerConnectEventsEnum {
    return LedgerConnectEventsEnum.DATA_UPDATE;
  }

  protected async setupEventListeners() {
    if (!this.eventBus) {
      return;
    }

    this.eventBus.subscribe(
      LedgerConnectEventsEnum.CLOSE_LEDGER_CONNECT_PANEL,
      this.handleCloseUI.bind(this)
    );
  }
}
