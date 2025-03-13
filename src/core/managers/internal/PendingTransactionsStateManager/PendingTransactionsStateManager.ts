import { IPendingTransactionsPanelData } from 'lib/sdkDappCoreUi';
import { IEventBus } from 'types/manager.types';
import { PendingTransactionsEventsEnum } from './types/pendingTransactions.types';

export class PendingTransactionsStateManager<
  T extends
    IEventBus<IPendingTransactionsPanelData> = IEventBus<IPendingTransactionsPanelData>
> {
  private eventBus: T;

  private initialData: IPendingTransactionsPanelData = {
    isPending: false,
    title: '',
    subtitle: '',
    shouldClose: false
  };

  private data: IPendingTransactionsPanelData = { ...this.initialData };

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

  public updateData(newData: IPendingTransactionsPanelData): void {
    this.data = { ...this.data, ...newData };
    this.notifyDataUpdate();
  }

  private notifyDataUpdate(): void {
    this.eventBus.publish(PendingTransactionsEventsEnum.DATA_UPDATE, this.data);
  }
}
