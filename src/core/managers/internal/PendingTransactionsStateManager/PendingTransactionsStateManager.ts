import { UITagsEnum } from 'constants/UITags.enum';
import {
  IPendingTransactionsPanelData,
  MvxPendingTransactionsPanel
} from 'lib/sdkDappCoreUi';
import { PendingTransactionsEventsEnum } from './types/pendingTransactions.types';
import { SidePanelBaseManager } from '../SidePanelBaseManager/SidePanelBaseManager';

export class PendingTransactionsStateManager extends SidePanelBaseManager<
  MvxPendingTransactionsPanel,
  IPendingTransactionsPanelData,
  PendingTransactionsEventsEnum
> {
  private static instance: PendingTransactionsStateManager;

  protected initialData: IPendingTransactionsPanelData = {
    isPending: false,
    title: '',
    subtitle: '',
    shouldClose: false
  };

  public static getInstance(): PendingTransactionsStateManager {
    if (!PendingTransactionsStateManager.instance) {
      PendingTransactionsStateManager.instance =
        new PendingTransactionsStateManager();
    }

    return PendingTransactionsStateManager.instance;
  }

  constructor() {
    super('pending-transactions');
    this.data = { ...this.initialData };
  }

  public isPendingTransactionsOpen(): boolean {
    return this.isOpen;
  }

  public async openPendingTransactions(data: IPendingTransactionsPanelData) {
    await this.openUI({ ...data, isPending: true });
  }

  protected getUIElementName(): UITagsEnum {
    return UITagsEnum.PENDING_TRANSACTIONS_PANEL;
  }

  protected getOpenEventName(): PendingTransactionsEventsEnum {
    return PendingTransactionsEventsEnum.OPEN_PENDING_TRANSACTIONS_PANEL;
  }

  protected getCloseEventName(): PendingTransactionsEventsEnum {
    return PendingTransactionsEventsEnum.CLOSE_PENDING_TRANSACTIONS;
  }

  protected getDataUpdateEventName(): PendingTransactionsEventsEnum {
    return PendingTransactionsEventsEnum.DATA_UPDATE;
  }

  protected async setupEventListeners() {
    if (!this.eventBus) {
      return;
    }

    this.eventBus.subscribe(
      PendingTransactionsEventsEnum.CLOSE_PENDING_TRANSACTIONS,
      this.handleCloseUI.bind(this)
    );
  }
}
