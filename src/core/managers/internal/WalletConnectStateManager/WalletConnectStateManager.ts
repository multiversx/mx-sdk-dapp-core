import { UITagsEnum } from 'constants/UITags.enum';
import {
  WalletConnectEventsEnum,
  IWalletConnectModalData
} from 'core/providers/strategies/WalletConnectProviderStrategy/types';
import { MvxWalletConnectProvider } from 'lib/sdkDappCoreUi';
import { SidePanelBaseManager } from '../SidePanelBaseManager/SidePanelBaseManager';

export class WalletConnectStateManager extends SidePanelBaseManager<
  MvxWalletConnectProvider,
  IWalletConnectModalData,
  WalletConnectEventsEnum
> {
  private static instance: WalletConnectStateManager;

  protected initialData: IWalletConnectModalData = {
    wcURI: '',
    shouldClose: false
  };

  public static getInstance(): WalletConnectStateManager {
    if (!WalletConnectStateManager.instance) {
      WalletConnectStateManager.instance = new WalletConnectStateManager();
    }
    return WalletConnectStateManager.instance;
  }

  constructor() {
    super('wallet-connect');
    this.data = { ...this.initialData };
  }

  public async openWalletConnect(data: IWalletConnectModalData) {
    await this.openUI(data);
  }

  public updateWcURI(uri: string): void {
    this.updateData({ wcURI: uri });
  }

  protected getUIElementName(): UITagsEnum {
    return this.anchor
      ? UITagsEnum.WALLET_CONNECT
      : UITagsEnum.WALLET_CONNECT_PANEL;
  }

  protected getOpenEventName(): WalletConnectEventsEnum {
    return WalletConnectEventsEnum.OPEN_WALLET_CONNECT_PANEL;
  }

  protected getCloseEventName(): WalletConnectEventsEnum {
    return WalletConnectEventsEnum.CLOSE_WALLET_CONNECT_PANEL;
  }

  protected getDataUpdateEventName(): WalletConnectEventsEnum {
    return WalletConnectEventsEnum.DATA_UPDATE;
  }

  protected async setupEventListeners() {
    if (!this.eventBus) {
      return;
    }

    this.eventBus.subscribe(
      WalletConnectEventsEnum.CLOSE_WALLET_CONNECT_PANEL,
      this.handleCloseUI.bind(this)
    );
    this.eventBus.subscribe(
      WalletConnectEventsEnum.UI_DISCONNECTED,
      this.destroy.bind(this)
    );
  }
}
