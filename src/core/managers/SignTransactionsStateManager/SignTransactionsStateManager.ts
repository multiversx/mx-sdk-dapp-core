import {
  ISignTransactionsModalData,
  SignEventsEnum
} from './types/signTransactionsModal.types';

interface IEventBus {
  publish(event: string, data: any): void;
}

const notInitializedError = () => new Error('Event bus not initialized');

export class SignTransactionsStateManager<T extends IEventBus = IEventBus> {
  private static instance: SignTransactionsStateManager<IEventBus> | null =
    null;
  public readonly addressesPerPage = 10;

  private eventBus: T = {
    publish: notInitializedError,
    subscribe: notInitializedError,
    unsubscribe: notInitializedError
  } as unknown as T;

  // whole data to be sent on update events
  private initialData: ISignTransactionsModalData = {
    transaction: null
  };

  private data: ISignTransactionsModalData = { ...this.initialData };

  private constructor(eventBus: T) {
    this.eventBus = eventBus;
    this.resetData();
  }

  public static getInstance<U extends IEventBus>(
    eventBus?: U
  ): SignTransactionsStateManager<U> | null {
    if (!eventBus) {
      return null;
    }
    if (!SignTransactionsStateManager.instance) {
      SignTransactionsStateManager.instance = new SignTransactionsStateManager(
        eventBus
      );
    }
    return SignTransactionsStateManager.instance as SignTransactionsStateManager<U>;
  }

  public updateTransaction(members: Partial<ISignTransactionsModalData>): void {
    this.data = {
      ...this.data,
      ...members
    };
    this.notifyDataUpdate();
  }

  private resetData(): void {
    this.data = { ...this.initialData };
  }

  public closeAndReset(): void {
    this.data.shouldClose = true;
    this.notifyDataUpdate();
    this.resetData();
  }

  private notifyDataUpdate(): void {
    this.eventBus.publish(SignEventsEnum.DATA_UPDATE, this.data);
  }
}
