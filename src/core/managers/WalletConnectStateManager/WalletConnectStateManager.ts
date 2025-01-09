import {
  IWalletConnectModalData,
  WalletConnectEventsEnum
} from 'core/providers/strategies/WalletConnectProviderStrategy/types';
import { IEventBus } from 'types/manager.types';

export class WalletConnectStateManager<
  T extends
    IEventBus<IWalletConnectModalData> = IEventBus<IWalletConnectModalData>
> {
  private eventBus: T;

  private initialData: IWalletConnectModalData = {
    wcURI: '',
    shouldClose: false
  };

  private data: IWalletConnectModalData = { ...this.initialData };

  constructor(eventBus: T) {
    this.eventBus = eventBus;
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
