import {
  IAccountScreenData,
  IConfirmScreenData,
  IConnectScreenData,
  ILedgerAccount,
  ILedgerConnectModalData,
  LedgerConnectEventsEnum
} from '../ledger.types';

export interface IEventBus {
  publish(event: string, data: any): void;
}

export class LedgerConnectStateManager<T extends IEventBus = IEventBus> {
  private static instance: LedgerConnectStateManager<IEventBus> | null = null;
  public readonly addressesPerPage = 10;

  private eventBus: T;
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
  private initialData: ILedgerConnectModalData = {
    connectScreenData: this.initialConnectScreenData,
    accountScreenData: null,
    confirmScreenData: null
  };

  private data: ILedgerConnectModalData = { ...this.initialData };

  private constructor(eventBus: T) {
    this.eventBus = eventBus;
    this.resetData();
  }

  public static getInstance<U extends IEventBus>(
    eventBus: U
  ): LedgerConnectStateManager<U> {
    if (!LedgerConnectStateManager.instance) {
      LedgerConnectStateManager.instance = new LedgerConnectStateManager(
        eventBus
      );
    }
    return LedgerConnectStateManager.instance as LedgerConnectStateManager<U>;
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
    this.resetData();
    this.eventBus.publish(LedgerConnectEventsEnum.CLOSE, {
      ...this.data,
      shouldClose: true
    });
  }

  public updateConnectScreen(members: Partial<IConnectScreenData>): void {
    this.connectScreenData = {
      ...this.connectScreenData,
      ...members
    };
    this.data.confirmScreenData = null;
    this.data.accountScreenData = null;
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
    this.eventBus.publish(LedgerConnectEventsEnum.DATA_UPDATE, this.data);
  }

  public getAccountScreenData(): IAccountScreenData {
    return this.accountScreenData ?? this.initialAccountScreenData;
  }

  public getConfirmScreenData(): IConfirmScreenData {
    return this.confirmScreenData ?? this.initialConfirmScreenData;
  }

  public getAllAccounts(): ILedgerAccount[] {
    return this.allAccounts;
  }
}
