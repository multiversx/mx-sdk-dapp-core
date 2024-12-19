import { IEventBus } from 'types/manager.types';
import {
  IPendingTransactionsModalData,
  PendingTransactionsEventsEnum
} from './types';

export class PendingTransactionsStateManager<
  T extends
    IEventBus<IPendingTransactionsModalData> = IEventBus<IPendingTransactionsModalData>
> {
  private static instance: PendingTransactionsStateManager<
    IEventBus<IPendingTransactionsModalData>
  > | null = null;
  private eventBus: T;

  private initialData: IPendingTransactionsModalData = {
    isPending: false,
    title: '',
    subtitle: '',
    shouldClose: false
  };

  private data: IPendingTransactionsModalData = { ...this.initialData };

  private constructor(eventBus: T) {
    this.eventBus = eventBus;
  }

  public static getInstance<U extends IEventBus<IPendingTransactionsModalData>>(
    eventBus: U
  ): PendingTransactionsStateManager<U> {
    if (!PendingTransactionsStateManager.instance) {
      PendingTransactionsStateManager.instance =
        new PendingTransactionsStateManager(eventBus);
    }
    return PendingTransactionsStateManager.instance as PendingTransactionsStateManager<U>;
  }

  public closeAndReset(): void {
    this.data.shouldClose = true;
    this.notifyDataUpdate();
    this.resetData();
  }

  private resetData(): void {
    this.data = { ...this.initialData };
  }

  public updateData(newData: IPendingTransactionsModalData): void {
    this.data = { ...this.data, ...newData };
    this.notifyDataUpdate();
  }

  private notifyDataUpdate(): void {
    this.eventBus.publish(PendingTransactionsEventsEnum.DATA_UPDATE, this.data);
  }
}
