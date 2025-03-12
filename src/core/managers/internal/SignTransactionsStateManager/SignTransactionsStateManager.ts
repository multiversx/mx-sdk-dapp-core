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
      currentIndex: 0
    },
    tokenTransaction: null,
    nftTransaction: null,
    sftTransaction: null
  };

  private _gasPriceMap: Record<
    number, // nonce
    {
      initialGasPrice: number;
      gasPriceMultiplier: ISignTransactionsModalCommonData['gasPriceMultiplier'];
    }
  > = {};

  private data: ISignTransactionsModalData = { ...this.initialData };

  constructor(eventBus: T) {
    this.eventBus = eventBus;
    this.resetData();
  }

  public updateData(newData: ISignTransactionsModalData) {
    this.data = { ...newData };
    this.notifyDataUpdate();
  }

  public updateGasPriceMap({
    nonce,
    gasPriceMultiplier,
    initialGasPrice
  }: {
    nonce: number;
    initialGasPrice?: number;
    gasPriceMultiplier: ISignTransactionsModalCommonData['gasPriceMultiplier'];
  }) {
    this._gasPriceMap[nonce] = {
      ...this._gasPriceMap[nonce],
      gasPriceMultiplier
    };
    if (initialGasPrice) {
      this._gasPriceMap[nonce].initialGasPrice = initialGasPrice;
    }
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
  }

  public closeAndReset(): void {
    this.data.shouldClose = true;
    this.notifyDataUpdate();
    this.resetData();
  }

  private notifyDataUpdate(): void {
    const data = { ...this.data };
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
    return this.data.commonData.currentIndex;
  }

  public get gasPriceMap() {
    return this._gasPriceMap;
  }
}
