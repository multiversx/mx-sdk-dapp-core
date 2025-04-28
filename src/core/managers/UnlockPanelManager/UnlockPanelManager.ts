import { UITagsEnum } from 'constants/UITags.enum';
import { ProviderFactory } from 'core/providers/ProviderFactory';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import { MvxUnlockPanel } from 'lib/sdkDappCoreUi';
import { IEventBus } from 'types/manager.types';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement } from 'utils/createUIElement';

interface IUnlockPanel {
  isOpen: boolean;
  allowedProviders?: ProviderTypeEnum[];
}

export enum UnlockPanelEventsEnum {
  OPEN_UNLOCK_PANEL = 'OPEN_UNLOCK_PANEL',
  CLOSE_UNLOCK_PANEL = 'CLOSE_UNLOCK_PANEL',
  HANDLE_LOGIN = 'HANDLE_LOGIN',
  HANDLE_CANCEL_LOGIN = 'HANDLE_CANCEL_LOGIN'
}

export class UnlockPanelManager {
  private static instance: UnlockPanelManager;
  private data: IUnlockPanel = {
    isOpen: false
  };
  private unlockPanelElement: MvxUnlockPanel | null = null;
  private eventBus: IEventBus<IUnlockPanel> | null = null;
  private static _login:
    | ((providerType: ProviderTypeEnum, anchor: HTMLElement) => void)
    | (() => void)
    | null = null;

  protected initialData = {
    isOpen: false
  };

  public static getInstance(): UnlockPanelManager {
    if (!UnlockPanelManager.instance) {
      UnlockPanelManager.instance = new UnlockPanelManager();
    }

    return UnlockPanelManager.instance;
  }

  public static init(
    login:
      | ((providerType: ProviderTypeEnum, anchor: HTMLElement) => void)
      | (() => void)
  ) {
    this._login = login;
    return this.getInstance();
  }

  constructor() {
    this.data = { ...this.initialData };
  }

  private async createUnlockPanelElement(): Promise<MvxUnlockPanel | null> {
    if (this.unlockPanelElement) {
      return this.unlockPanelElement;
    }

    this.unlockPanelElement = await createUIElement<MvxUnlockPanel>({
      name: UITagsEnum.UNLOCK_PANEL
    });

    return this.unlockPanelElement;
  }

  public async openUnlockPanel(allowedProviders?: ProviderTypeEnum[]) {
    if (this.data.isOpen && this.unlockPanelElement) {
      return;
    }

    this.data.isOpen = true;
    this.data.allowedProviders = allowedProviders;

    await this.createUnlockPanelElement();

    if (!this.unlockPanelElement) {
      throw new Error(
        `Failed to create ${UITagsEnum.PENDING_TRANSACTIONS_PANEL} element`
      );
    }

    if (!this.eventBus) {
      this.eventBus = await this.unlockPanelElement.getEventBus();
    }

    if (!this.eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    this.eventBus.publish(UnlockPanelEventsEnum.OPEN_UNLOCK_PANEL, this.data);
    this.eventBus.subscribe(
      UnlockPanelEventsEnum.HANDLE_LOGIN,
      this.handleLogin.bind(this)
    );
    this.eventBus.subscribe(
      UnlockPanelEventsEnum.CLOSE_UNLOCK_PANEL,
      this.handleCloseUI.bind(this)
    );
  }

  private async handleCloseUI() {
    if (this.unlockPanelElement) {
      await this.unlockPanelElement.reset();
      this.unlockPanelElement.remove();
      this.unlockPanelElement = null;
    }
    this.data.isOpen = false;
    this.data.allowedProviders = undefined;
  }

  private async handleLogin({
    type,
    anchor
  }: {
    type: ProviderTypeEnum;
    anchor: HTMLElement;
  }) {
    if (!UnlockPanelManager._login) {
      throw new Error(
        'Login method is not initialized. Please ensure that you have called the init method before attempting to log in.'
      );
    }

    if (this.isLoginCallback(UnlockPanelManager._login)) {
      const provider = await ProviderFactory.create({
        type,
        anchor
      });
      await provider?.login();
      UnlockPanelManager._login();
      return;
    }

    UnlockPanelManager._login(type, anchor);
  }

  private isLoginCallback(
    login:
      | ((providerType: ProviderTypeEnum, anchor: HTMLElement) => void)
      | (() => void)
  ): login is () => void {
    return login.length === 0;
  }
}
