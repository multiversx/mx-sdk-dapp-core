import { EMPTY_PPU } from 'constants/placeholders.constants';
import { UITagsEnum } from 'constants/UITags.enum';
import { Transaction } from 'lib/sdkCore';
import { SignTransactionsPanel } from 'lib/sdkDappCoreUi';
import { IEventBus } from 'types/manager.types';
import { ProviderErrorsEnum } from 'types/provider.types';

import { NftEnumType } from 'types/tokens.types';
import { createUIElement } from 'utils/createUIElement';
import {
  FungibleTransactionType,
  ISignTransactionsPanelData,
  SignEventsEnum,
  TokenType,
  ISignTransactionsPanelCommonData
} from './types/signTransactionsPanel.types';

export class SignTransactionsStateManager {
  private static instance: SignTransactionsStateManager;
  private eventBus: IEventBus<ISignTransactionsPanelData> | null = null;
  private signTransactionsElement: SignTransactionsPanel | null = null;
  private isCreatingElement = false;
  private isOpen = false;
  public readonly addressesPerPage = 10;

  // whole data to be sent on update events
  private initialData: ISignTransactionsPanelData = {
    commonData: {
      transactionsCount: 0,
      egldLabel: '',
      currentIndex: 0,
      ppuOptions: []
    },
    tokenTransaction: null,
    nftTransaction: null,
    sftTransaction: null
  };

  private _ppuMap: Record<
    number, // nonce
    {
      initialGasPrice: number;
      ppu: ISignTransactionsPanelCommonData['ppu'];
    }
  > = {};

  private data: ISignTransactionsPanelData = { ...this.initialData };

  public static getInstance(): SignTransactionsStateManager {
    if (!SignTransactionsStateManager.instance) {
      SignTransactionsStateManager.instance =
        new SignTransactionsStateManager();
    }
    return SignTransactionsStateManager.instance;
  }

  private constructor() {}

  public async init() {
    await this.createSignTransactionsElement();
    await this.getEventBus();
    await this.setupEventListeners();
    this.resetData();
  }

  public async openSignTransactions(data: ISignTransactionsPanelData) {
    if (this.isOpen && this.signTransactionsElement) {
      return;
    }

    if (!this.signTransactionsElement) {
      await this.createSignTransactionsElement();
    }

    if (!this.signTransactionsElement || !this.eventBus) {
      return;
    }

    this.data = { ...this.initialData, ...data };
    this.isOpen = true;

    this.publishEvent(SignEventsEnum.OPEN_SIGN_TRANSACTIONS_PANEL);
    this.notifyDataUpdate();
  }

  private publishEvent(event: string, data?: ISignTransactionsPanelData) {
    if (!this.eventBus) {
      return;
    }

    this.eventBus.publish(event, data || this.data);
  }

  public updateData(newData: ISignTransactionsPanelData) {
    this.data = { ...newData };
    this.notifyDataUpdate();
  }

  public initializeGasPriceMap(transactions: Transaction[]) {
    transactions
      .filter((tx) => tx != null)
      .forEach((transaction) => {
        const initialGasPrice = transaction
          ? transaction.toPlainObject().gasPrice
          : 0;
        const ppu = EMPTY_PPU;
        this.updateGasPriceMap({
          nonce: transaction?.toPlainObject().nonce,
          ppu,
          initialGasPrice
        });
      });
  }

  public updateGasPriceMap({
    nonce,
    ppu,
    initialGasPrice
  }: {
    nonce: number;
    initialGasPrice?: number;
    ppu: ISignTransactionsPanelCommonData['ppu'];
  }) {
    this._ppuMap[nonce] = {
      ...this._ppuMap[nonce],
      ppu
    };
    if (initialGasPrice) {
      this._ppuMap[nonce].initialGasPrice = initialGasPrice;
    }
    this.updateCommonData({ ppu });
  }

  public updateCommonData(
    newCommonData: Partial<ISignTransactionsPanelCommonData>
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
    if (!this.eventBus || !this.isOpen) {
      return;
    }

    this.data.shouldClose = true;
    this.notifyDataUpdate();
    this.resetData();
    this.isOpen = false;

    this.publishEvent(SignEventsEnum.CLOSE_SIGN_TRANSACTIONS_PANEL);
  }

  private notifyDataUpdate(): void {
    if (!this.eventBus) {
      return;
    }

    const data = { ...this.data };
    this.publishEvent(SignEventsEnum.DATA_UPDATE, data);
    this.eventBus.publish(SignEventsEnum.DATA_UPDATE, data);
  }

  public updateTokenTransaction(
    tokenData: ISignTransactionsPanelData['tokenTransaction']
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

  public get ppuMap() {
    return this._ppuMap;
  }

  public async getEventBus(): Promise<IEventBus<ISignTransactionsPanelData> | null> {
    if (!this.signTransactionsElement) {
      await this.createSignTransactionsElement();
    }

    if (!this.signTransactionsElement) {
      return null;
    }

    if (!this.eventBus) {
      this.eventBus = await this.signTransactionsElement.getEventBus();
    }

    if (!this.eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    return this.eventBus;
  }

  private async createSignTransactionsElement(): Promise<SignTransactionsPanel | null> {
    if (this.signTransactionsElement) {
      return this.signTransactionsElement;
    }

    if (!this.isCreatingElement) {
      this.isCreatingElement = true;
      const element = await createUIElement<SignTransactionsPanel>({
        name: UITagsEnum.SIGN_TRANSACTIONS_PANEL
      });

      this.signTransactionsElement = element || null;
      await this.getEventBus();
      this.isCreatingElement = false;
    }

    if (!this.signTransactionsElement) {
      throw new Error('Failed to create sign transactions element');
    }

    return this.signTransactionsElement;
  }

  private async setupEventListeners() {
    if (!this.signTransactionsElement) {
      await this.createSignTransactionsElement();
    }

    if (!this.eventBus) {
      return;
    }

    this.eventBus.subscribe(
      SignEventsEnum.CLOSE_SIGN_TRANSACTIONS_PANEL,
      this.handleCloseSignTransactions.bind(this)
    );
  }

  private handleCloseSignTransactions() {
    this.isOpen = false;
    this.resetData();
  }

  public destroy() {
    if (this.eventBus) {
      this.eventBus.unsubscribe(
        SignEventsEnum.CLOSE_SIGN_TRANSACTIONS_PANEL,
        this.handleCloseSignTransactions.bind(this)
      );

      this.eventBus = null;
    }

    if (this.signTransactionsElement) {
      const parentElement = this.signTransactionsElement.parentElement;

      if (parentElement) {
        parentElement.removeChild(this.signTransactionsElement);
      }

      this.signTransactionsElement = null;
    }

    this.isOpen = false;
  }
}
