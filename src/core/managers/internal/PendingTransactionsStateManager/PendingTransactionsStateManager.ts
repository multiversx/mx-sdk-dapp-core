import { UITagsEnum } from 'constants/UITags.enum';
import {
  IPendingTransactionsPanelData,
  PendingTransactionsPanel
} from 'lib/sdkDappCoreUi';
import { PendingTransactionsEventsEnum } from './types/pendingTransactions.types';
import { SidePanelBaseManager } from '../../SidePanelBaseManager/SidePanelBaseManager';

export class PendingTransactionsStateManager extends SidePanelBaseManager<
  PendingTransactionsPanel,
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

  public async getEventBus(): Promise<IEventBus | null> {
    if (!this.pendingTransactionsElement) {
      await this.createPendingTransactionsElement();
    }

    if (!this.pendingTransactionsElement) {
      return null;
    }

    if (!this.eventBus) {
      this.eventBus = await this.pendingTransactionsElement.getEventBus();
    }

    if (!this.eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    return this.eventBus;
  }

  private async createPendingTransactionsElement(): Promise<PendingTransactionsPanel | null> {
    if (this.pendingTransactionsElement) {
      return this.pendingTransactionsElement;
    }

    if (!this.isCreatingElement) {
      this.isCreatingElement = true;
      const element = await createUIElement<PendingTransactionsPanel>({
        name: UITagsEnum.PENDING_TRANSACTIONS_PANEL
      });

      this.pendingTransactionsElement = element || null;
      await this.getEventBus();
      this.isCreatingElement = false;
    }

    if (!this.pendingTransactionsElement) {
      throw new Error('Failed to create pending transactions element');
    }

    return this.pendingTransactionsElement;
  }

  private async setupEventListeners() {
    if (!this.pendingTransactionsElement) {
      await this.createPendingTransactionsElement();
    }

    if (!this.eventBus) {
      return;
    }

    this.eventBus.subscribe(
      PendingTransactionsEventsEnum.CLOSE_PENDING_TRANSACTIONS,
      this.handleClosePendingTransactions.bind(this)
    );
  }

  private handleClosePendingTransactions() {
    this.isOpen = false;
    this.resetData();
  }

  public destroy() {
    if (this.eventBus) {
      this.eventBus.unsubscribe(
        PendingTransactionsEventsEnum.CLOSE_PENDING_TRANSACTIONS,
        this.handleClosePendingTransactions.bind(this)
      );

      this.eventBus = null;
    }

    if (this.pendingTransactionsElement) {
      const parentElement = this.pendingTransactionsElement.parentElement;

      if (parentElement) {
        parentElement.removeChild(this.pendingTransactionsElement);
      }

      this.pendingTransactionsElement = null;
    }

    this.isOpen = false;
  }
}
