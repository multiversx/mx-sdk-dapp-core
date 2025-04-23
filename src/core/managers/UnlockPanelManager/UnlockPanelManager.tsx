import { UITagsEnum } from 'constants/UITags.enum';

export class UnlockPanelManager {
  private static instance: UnlockPanelManager;
  private data: { isOpen: boolean } = { isOpen: false };

  protected initialData = {
    isOpen: false
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

  public openUnlockPanel() {
    this.data.isOpen = true;
  }
}
