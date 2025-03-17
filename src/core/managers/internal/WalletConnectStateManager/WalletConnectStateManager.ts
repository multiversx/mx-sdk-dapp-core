import { UITagsEnum } from 'constants/UITags.enum';
import {
  WalletConnectEventsEnum,
  IWalletConnectModalData
} from 'core/providers/strategies/WalletConnectProviderStrategy/types';
import { WalletConnectPanel, IEventBus } from 'lib/sdkDappCoreUi';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement } from 'utils/createUIElement';

export class WalletConnectStateManager {
  private static instance: WalletConnectStateManager;
  private eventBus: IEventBus | null = null;
  private walletConnectElement: WalletConnectPanel | null = null;
  private isCreatingElement = false;
  private isOpen = false;

  private initialData: IWalletConnectModalData = {
    wcURI: '',
    shouldClose: false
  };

  private data: IWalletConnectModalData = { ...this.initialData };

  public static getInstance(): WalletConnectStateManager {
    if (!WalletConnectStateManager.instance) {
      WalletConnectStateManager.instance = new WalletConnectStateManager();
    }
    return WalletConnectStateManager.instance;
  }

  private constructor() {}

  public async init() {
    await this.createWalletConnectElement();
    await this.getEventBus();
    await this.setupEventListeners();
  }

  public async openWalletConnect(data: IWalletConnectModalData) {
    if (this.isOpen && this.walletConnectElement) {
      return;
    }

    if (!this.walletConnectElement) {
      await this.createWalletConnectElement();
    }

    if (!this.walletConnectElement || !this.eventBus) {
      return;
    }

    this.data = { ...this.initialData, ...data };
    this.isOpen = true;

    this.publishEvent(WalletConnectEventsEnum.OPEN_WALLET_CONNECT_PANEL);
    this.notifyDataUpdate();
  }

  private publishEvent(event: string, data?: IWalletConnectModalData) {
    if (!this.eventBus) {
      return;
    }

    this.eventBus.publish(event, data || this.data);
  }

  public updateWcURI(uri: string): void {
    this.data.wcURI = uri;
    this.notifyDataUpdate();
  }

  public closeAndReset(): void {
    if (!this.eventBus || !this.isOpen) {
      return;
    }

    this.data.shouldClose = true;
    this.notifyDataUpdate();
    this.resetData();
    this.isOpen = false;

    this.publishEvent(WalletConnectEventsEnum.CLOSE_WALLET_CONNECT_PANEL);
  }

  private resetData(): void {
    this.data = { ...this.initialData };
  }

  public updateData(newData: Partial<IWalletConnectModalData>): void {
    this.data = { ...this.data, ...newData };
    this.notifyDataUpdate();
  }

  private notifyDataUpdate(): void {
    if (!this.eventBus) {
      return;
    }

    this.publishEvent(WalletConnectEventsEnum.DATA_UPDATE, this.data);
  }

  public async getEventBus(): Promise<IEventBus | null> {
    if (!this.walletConnectElement) {
      await this.createWalletConnectElement();
    }

    if (!this.walletConnectElement) {
      return null;
    }

    if (!this.eventBus) {
      this.eventBus = await this.walletConnectElement.getEventBus();
    }

    if (!this.eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    return this.eventBus;
  }

  private async createWalletConnectElement(): Promise<WalletConnectPanel | null> {
    if (this.walletConnectElement) {
      return this.walletConnectElement;
    }

    if (!this.isCreatingElement) {
      this.isCreatingElement = true;
      const element = await createUIElement<WalletConnectPanel>({
        name: UITagsEnum.WALLET_CONNECT_PANEL
      });

      this.walletConnectElement = element || null;
      await this.getEventBus();
      this.isCreatingElement = false;
    }

    if (!this.walletConnectElement) {
      throw new Error('Failed to create wallet connect element');
    }

    return this.walletConnectElement;
  }

  private async setupEventListeners() {
    if (!this.walletConnectElement) {
      await this.createWalletConnectElement();
    }

    if (!this.eventBus) {
      return;
    }

    this.eventBus.subscribe(
      WalletConnectEventsEnum.CLOSE_WALLET_CONNECT_PANEL,
      this.handleCloseWalletConnect.bind(this)
    );
  }

  private handleCloseWalletConnect() {
    this.isOpen = false;
    this.resetData();
  }

  public destroy() {
    if (this.eventBus) {
      this.eventBus.unsubscribe(
        WalletConnectEventsEnum.CLOSE_WALLET_CONNECT_PANEL,
        this.handleCloseWalletConnect.bind(this)
      );

      this.eventBus = null;
    }

    if (this.walletConnectElement) {
      const parentElement = this.walletConnectElement.parentElement;

      if (parentElement) {
        parentElement.removeChild(this.walletConnectElement);
      }

      this.walletConnectElement = null;
    }

    this.isOpen = false;
  }
}
