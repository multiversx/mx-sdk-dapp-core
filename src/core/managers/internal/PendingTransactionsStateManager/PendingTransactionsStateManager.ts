import { UITagsEnum } from 'constants/UITags.enum';
import { IPendingTransactionsPanelData } from 'lib/sdkDappCoreUi';
import { PendingTransactionsPanel, IEventBus } from 'lib/sdkDappCoreUi';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement } from 'utils/createUIElement';
import { PendingTransactionsEventsEnum } from '../PendingTransactionsStateManager/types/pendingTransactions.types';

export class PendingTransactionsStateManager {
  private static instance: PendingTransactionsStateManager;
  private eventBus: IEventBus | null = null;
  private pendingTransactionsElement: PendingTransactionsPanel | null = null;
  private isCreatingElement = false;
  private isOpen = false;

  private initialData: IPendingTransactionsPanelData = {
    isPending: false,
    title: '',
    subtitle: '',
    shouldClose: false
  };

  private data: IPendingTransactionsPanelData = { ...this.initialData };

  public static getInstance(): PendingTransactionsStateManager {
    if (!PendingTransactionsStateManager.instance) {
      PendingTransactionsStateManager.instance =
        new PendingTransactionsStateManager();
    }

    return PendingTransactionsStateManager.instance;
  }

  private constructor() {}

  public isPendingTransactionsOpen(): boolean {
    return this.isOpen;
  }

  public async init() {
    await this.createPendingTransactionsElement();
    await this.getEventBus();
    await this.setupEventListeners();
  }

  public async openPendingTransactions(data: IPendingTransactionsPanelData) {
    if (this.isOpen && this.pendingTransactionsElement) {
      return;
    }

    if (!this.pendingTransactionsElement) {
      await this.createPendingTransactionsElement();
    }

    if (!this.pendingTransactionsElement || !this.eventBus) {
      return;
    }

    this.data = { ...this.initialData, ...data, isPending: true };
    this.isOpen = true;
    this.eventBus.publish(
      PendingTransactionsEventsEnum.OPEN_PENDING_TRANSACTIONS_PANEL
    );

    this.updatePanel();
  }

  public closeAndReset(): void {
    if (!this.eventBus || !this.isOpen) {
      return;
    }

    this.data.shouldClose = true;
    this.updatePanel();
    this.resetData();
    this.isOpen = false;
    this.eventBus.publish(
      PendingTransactionsEventsEnum.CLOSE_PENDING_TRANSACTIONS
    );
  }

  private resetData(): void {
    this.data = { ...this.initialData };
  }

  public updateData(newData: Partial<IPendingTransactionsPanelData>): void {
    this.data = { ...this.data, ...newData };
    this.updatePanel();
  }

  private updatePanel(): void {
    if (!this.eventBus) {
      return;
    }

    this.eventBus.publish(PendingTransactionsEventsEnum.DATA_UPDATE, this.data);
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
