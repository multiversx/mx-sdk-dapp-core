import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import {
  IPendingTransactionsModalData,
  PendingTransactionsEventsEnum
} from './pendingTransactions.types';

export interface IEventBus {
  publish(event: string, data: any): void;
}

export class PendingTransactionsStateManager<T extends IEventBus = IEventBus> {
  private static instance: PendingTransactionsStateManager<IEventBus> | null =
    null;
  private eventBus: T;

  private initialData: IPendingTransactionsModalData = {
    isPending: false,
    title: '',
    subtitle: '',
    shouldClose: false,
    type: ProviderTypeEnum.none
  };

  private data: IPendingTransactionsModalData = { ...this.initialData };

  private constructor(eventBus: T) {
    this.eventBus = eventBus;
  }

  public static getInstance<U extends IEventBus>(
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

  public updateData(data: IPendingTransactionsModalData): void {
    this.data = { ...this.data, ...data };
    this.notifyDataUpdate();
  }

  private notifyDataUpdate(): void {
    this.eventBus.publish(PendingTransactionsEventsEnum.DATA_UPDATE, this.data);
  }
}
