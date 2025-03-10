import { IEventBus } from 'types/manager.types';
import { NftEnumType } from 'types/tokens.types';
import {
  FungibleTransactionType,
  ISignTransactionsModalCommonData,
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
      currentTransactionIndex: 0
    },
    tokenTransaction: null,
    nftTransaction: null,
    sftTransaction: null
  };

  private _gasPriceMap: Array<{
    initialGasPrice: number;
    gasPriceMultiplier: ISignTransactionsModalCommonData['gasPriceMultiplier'];
  }> = [];

  private data: ISignTransactionsModalData = { ...this.initialData };
  /**
   * An array storing the confirmed screens.
   */
  private _confirmedScreens: Record<number, ISignTransactionsModalData> = {};
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

  public updateGasPriceMap(gasPriceMap: typeof this._gasPriceMap) {
    this._gasPriceMap = gasPriceMap;
    const currentIndex = this.data.commonData.currentTransactionIndex;
    const { gasPriceMultiplier } = gasPriceMap[currentIndex];

    this.updateCommonData({ gasPriceMultiplier });
  }

  public updateCommonData(
    newCommonData: Partial<ISignTransactionsModalCommonData>
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

  public updateNonFungibleTransaction(
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
    return this.data.commonData.currentTransactionIndex;
  }

  public updateConfirmedTransactions() {
    this._confirmedScreens[this.data.commonData.currentTransactionIndex] = {
      ...this.data
    };
  }

  public get confirmedScreens() {
    return this._confirmedScreens;
  }

  public get gasPriceMap() {
    return this._gasPriceMap;
  }

  public setNextUnsignedTxIndex(index: number) {
    this.nextUnsignedTxIndex = index;
  }
}
