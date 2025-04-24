import { UITagsEnum } from 'constants/UITags.enum';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';
import { MvxUnlockPanel } from 'lib/sdkDappCoreUi';
import { IEventBus } from 'types/manager.types';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement } from 'utils/createUIElement';

interface IUnlockPanel {
  isOpen: boolean;
  allowedProviders: ProviderTypeEnum[];
}

export enum UnlockPanelEventsEnum {
  OPEN_UNLOCK_PANEL = 'OPEN_UNLOCK_PANEL',
  CLOSE_UNLOCK_PANEL = 'CLOSE_UNLOCK_PANEL',
  HANDLE_LOGIN = 'HANDLE_LOGIN',
  HANDLE_CANCEL_LOGIN = 'HANDLE_CANCEL_LOGIN'
}

export class UnlockPanelManager {
  private static instance: UnlockPanelManager;
  private data: { isOpen: boolean; allowedProviders: ProviderTypeEnum[] } = {
    isOpen: false,
    allowedProviders: []
  };
  private unlockPanelElement: MvxUnlockPanel | null = null;
  private eventBus: IEventBus<IUnlockPanel> | null = null;

  protected initialData = {
    isOpen: false,
    allowedProviders: []
  };

  public static getInstance(): UnlockPanelManager {
    if (!UnlockPanelManager.instance) {
      UnlockPanelManager.instance = new UnlockPanelManager();
    }

    return UnlockPanelManager.instance;
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

  public async openUnlockPanel(allowedProviders: ProviderTypeEnum[] = []) {
    if (this.data.isOpen && this.unlockPanelElement) {
      return;
    }

    this.data.isOpen = true;
    this.data.allowedProviders = allowedProviders || [];

    if (!this.unlockPanelElement) {
      await this.createUnlockPanelElement();
    }

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
  }
}
