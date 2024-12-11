import {
  IWalletConnectModalData,
  WalletConnectEventsEnum
} from '../walletConnect.types';

export interface IEventBus {
  publish(event: string, data: any): void;
}

export class WalletConnectStateManager<T extends IEventBus = IEventBus> {
  private static instance: WalletConnectStateManager<IEventBus> | null = null;
  private eventBus: T;

  private initialData: IWalletConnectModalData = {
    wcURI: '',
    shouldClose: false
  };

  private data: IWalletConnectModalData = { ...this.initialData };

  private constructor(eventBus: T) {
    this.eventBus = eventBus;
  }

  public static getInstance<U extends IEventBus>(
    eventBus: U
  ): WalletConnectStateManager<U> {
    if (!WalletConnectStateManager.instance) {
      WalletConnectStateManager.instance = new WalletConnectStateManager(
        eventBus
      );
    }
    return WalletConnectStateManager.instance as WalletConnectStateManager<U>;
  }

  public closeAndReset(): void {
    this.data.shouldClose = true;
    this.notifyDataUpdate();
    this.resetData();
  }

  private resetData(): void {
    this.data = { ...this.initialData };
  }

  public updateWcURI(wcURI: string): void {
    this.data.wcURI = wcURI;
    this.notifyDataUpdate();
  }

  private notifyDataUpdate(): void {
    this.eventBus.publish(WalletConnectEventsEnum.DATA_UPDATE, this.data);
  }
}
