import { IEventBus } from 'types/manager.types';
import { NftEnumType } from 'types/tokens.types';
import {
  FungibleTransactionType,
  ISignTransactionsModalData,
  SignEventsEnum,
  TokenType
} from './types/signTransactionsModal.types';

const notInitializedError = () => new Error('Event bus not initialized');

export class SignTransactionsStateManager<
  T extends
    IEventBus<ISignTransactionsModalData> = IEventBus<ISignTransactionsModalData>
> {
  public readonly addressesPerPage = 10;

  private eventBus: T = {
    publish: notInitializedError,
    subscribe: notInitializedError,
    unsubscribe: notInitializedError
  } as unknown as T;

  // whole data to be sent on update events
  private initialData: ISignTransactionsModalData = {
    commonData: {
      transactionsCount: 0,
      egldLabel: '',
      currentIndex: 0,
      highlight: null,
      scCall: null
    },
    tokenTransaction: null,
    nftTransaction: null,
    sftTransaction: null
  };

  private data: ISignTransactionsModalData = { ...this.initialData };
  /**
   * An array storing the confirmed screens.
   */
  private _confirmedScreens: ISignTransactionsModalData[] = [];
  /**
   * Tracks the index of the next unsigned transaction to be processed.
   */
  private nextUnsignedTxIndex: number = 0;

  constructor(eventBus: T) {
    this.eventBus = eventBus;
    this.resetData();
  }

  public updateData(newData: ISignTransactionsModalData) {
    this.data = { ...newData };
    this.notifyDataUpdate();
  }

  public updateCommonData(
    newCommonData: Partial<ISignTransactionsModalData['commonData']>
  ): void {
    this.data.commonData = {
      ...this.data.commonData,
      ...newCommonData
    };
    this.notifyDataUpdate();
  }

  private resetData(): void {
    this.data = { ...this.initialData };
    this._confirmedScreens = [];
  }

  public closeAndReset(): void {
    this.data.shouldClose = true;
    this.notifyDataUpdate();
    this.resetData();
  }

  private notifyDataUpdate(): void {
    const data = { ...this.data };
    data.commonData.nextUnsignedTxIndex = this.nextUnsignedTxIndex;

    this.eventBus.publish(SignEventsEnum.DATA_UPDATE, data);
  }

  public updateTokenTransaction(
    tokenData: ISignTransactionsModalData['tokenTransaction']
  ): void {
    this.data.tokenTransaction = tokenData;
    this.data.sftTransaction = null;
    this.data.nftTransaction = null;

    this.notifyDataUpdate();
  }

  public updateFungibleTransaction(
    type: TokenType,
    fungibleData: FungibleTransactionType
  ): void {
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

  public get currentScreenIndex() {
    return this.data.commonData.currentIndex;
  }

  public updateConfirmedTransactions() {
    const currentScreenData = { ...this.data };

    const exists = this._confirmedScreens.some(
      (screenData) =>
        JSON.stringify(screenData) === JSON.stringify(currentScreenData)
    );

    if (exists) {
      return;
    }

    this._confirmedScreens.push(currentScreenData);
  }

  public get confirmedScreens() {
    return this._confirmedScreens;
  }

  public setNextUnsignedTxIndex(index: number) {
    this.nextUnsignedTxIndex = index;
  }
}
