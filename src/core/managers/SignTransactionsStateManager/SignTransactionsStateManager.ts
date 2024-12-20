import { NftEnumType } from 'types/tokens.types';
import { FungibleTransactionType, ISignTransactionsModalData, SignEventsEnum, TokenType } from './types/signTransactionsModal.types';

interface IEventBus {
  publish(event: string, data: any): void;
}

const notInitializedError = () => new Error('Event bus not initialized');

export class SignTransactionsStateManager<T extends IEventBus = IEventBus> {
  private static instance: SignTransactionsStateManager<IEventBus> | null = null;
  public readonly addressesPerPage = 10;

  private eventBus: T = {
    publish: notInitializedError,
    subscribe: notInitializedError,
    unsubscribe: notInitializedError,
  } as unknown as T;

  // whole data to be sent on update events
  private initialData: ISignTransactionsModalData = {
    commonData: { transactionsCount: 0, egldLabel: '', currentIndex: 0 },
    tokenTransaction: null,
    nftTransaction: null,
    sftTransaction: null,
  };

  private data: ISignTransactionsModalData = { ...this.initialData };

  private constructor(eventBus: T) {
    this.eventBus = eventBus;
    this.resetData();
  }

  public static getInstance<U extends IEventBus>(eventBus?: U): SignTransactionsStateManager<U> | null {
    if (!eventBus) {
      return null;
    }
    if (!SignTransactionsStateManager.instance) {
      SignTransactionsStateManager.instance = new SignTransactionsStateManager(eventBus);
    }
    return SignTransactionsStateManager.instance as SignTransactionsStateManager<U>;
  }

  public updateCommonData(members: Partial<ISignTransactionsModalData['commonData']>): void {
    this.data.commonData = {
      ...this.data.commonData,
      ...members,
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

  public updateTokenTransaction(tokenData: ISignTransactionsModalData['tokenTransaction']): void {
    this.data.tokenTransaction = tokenData;
    this.data.sftTransaction = null;
    this.data.nftTransaction = null;

    this.notifyDataUpdate();
  }

  public updateFungibleTransaction(type: TokenType, fungibleData: FungibleTransactionType): void {
    switch (type) {
      case NftEnumType.NonFungibleESDT:
        this.data.nftTransaction = fungibleData;
        this.data.tokenTransaction = null;
        this.data.sftTransaction = null;
        break;
      case NftEnumType.SemiFungibleESDT:
        this.data.sftTransaction = fungibleData;
        this.data.nftTransaction = null;
        this.data.tokenTransaction = null;
        break;
      default:
        break;
    }

    this.notifyDataUpdate();
  }
}
