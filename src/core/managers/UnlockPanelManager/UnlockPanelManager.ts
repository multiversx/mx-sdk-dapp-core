import { UITagsEnum } from 'constants/UITags.enum';
import { ProviderFactory } from 'core/providers/ProviderFactory';
import {
  IProviderFactory,
  ProviderTypeEnum
} from 'core/providers/types/providerFactory.types';
import { MvxUnlockPanel } from 'lib/sdkDappCoreUi';
import { IEventBus } from 'types/manager.types';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement } from 'utils/createUIElement';
import {
  IUnlockPanel,
  UnlockPanelEventsEnum
} from './UnlockPanelManager.types';

/**
 * Handle the full login process
 * @example
 * ```ts
    async ({ type, anchor }: IProviderFactory) => {
      const provider = await ProviderFactory.create({
        type,
        anchor
      });
      await provider?.login();
      navigate('/dashboard');
    };
 *  ```
 */
type LoginFunctonType = (({ type, anchor }: IProviderFactory) => Promise<void>);

/**
 * Callback to be executed after login is performed
 * @example
 * ```ts
    () => {
      navigate('/dashboard');
    };
 *  ```
 */
type LoginCallbackType = (() => void)

export type LoginCallbackType =
  | LoginFunctonType
  | LoginCallbackType;

export class UnlockPanelManager {
  private static instance: UnlockPanelManager;
  private static loginCallback: LoginCallbackType | null = null;
  private static allowedProviders?: ProviderTypeEnum[] | null = null;

  private data: IUnlockPanel = { isOpen: false };
  private unlockPanelElement: MvxUnlockPanel | null = null;
  private eventBus: IEventBus<IUnlockPanel> | null = null;

  private readonly initialData: IUnlockPanel = { isOpen: false };

  private constructor() {
    this.data = { ...this.initialData };
  }

  public static getInstance(): UnlockPanelManager {
    if (!UnlockPanelManager.instance) {
      UnlockPanelManager.instance = new UnlockPanelManager();
    }
    return UnlockPanelManager.instance;
  }

  public static init(params: {
    loginCallback: LoginCallbackType;
    allowedProviders?: ProviderTypeEnum[] | null;
  }) {
    this.loginCallback = params.loginCallback;
    this.allowedProviders = params.allowedProviders;
    return this.getInstance();
  }

  public async openUnlockPanel() {
    if (this.data.isOpen) return;

    this.data = {
      isOpen: true,
      allowedProviders: UnlockPanelManager.allowedProviders
    };

    await this.ensureUnlockPanelElementExists();
    await this.ensureEventBus();
    this.eventBus?.publish(UnlockPanelEventsEnum.OPEN, this.data);

    this.subscribeToEvents();
  }

  private async ensureUnlockPanelElementExists() {
    if (!this.unlockPanelElement) {
      this.unlockPanelElement = await createUIElement<MvxUnlockPanel>({
        name: UITagsEnum.UNLOCK_PANEL
      });

      if (!this.unlockPanelElement) {
        throw new Error(`Failed to create ${UITagsEnum.UNLOCK_PANEL} element`);
      }
    }
  }

  private async ensureEventBus() {
    if (!this.eventBus && this.unlockPanelElement) {
      this.eventBus = await this.unlockPanelElement.getEventBus();

      if (!this.eventBus) {
        throw new Error(ProviderErrorsEnum.eventBusError);
      }
    }
  }

  private subscribeToEvents() {
    this.eventBus?.subscribe(
      UnlockPanelEventsEnum.LOGIN,
      this.handleLogin.bind(this)
    );
    this.eventBus?.subscribe(
      UnlockPanelEventsEnum.CANCEL_LOGIN,
      this.handleCancelLogin.bind(this)
    );
    this.eventBus?.subscribe(
      UnlockPanelEventsEnum.CLOSE,
      this.handleCloseUI.bind(this)
    );
  }

  private async handleCloseUI() {
    this.data = { ...this.initialData };
    await this.destroyUnlockPanel();
  }

  private async handleLogin({ type, anchor }: IProviderFactory) {
    if (!UnlockPanelManager.loginCallback) {
      throw new Error(
        'Login callback not initialized. Please call `init()` first.'
      );
    }

    if (this.isSimpleLoginCallback(UnlockPanelManager.loginCallback)) {
      const provider = await ProviderFactory.create({ type, anchor });
      await provider?.login();
      UnlockPanelManager.loginCallback();
    } else {
      UnlockPanelManager.loginCallback({ type, anchor });
    }

    await this.handleCloseUI();
  }

  private async handleCancelLogin() {
    await ProviderFactory.destroy();
  }

  private async destroyUnlockPanel() {
    this.eventBus = null;
    this.unlockPanelElement?.remove();
    this.unlockPanelElement = null;
  }

  private isSimpleLoginCallback(login: LoginCallbackType): login is () => void {
    const takesZeroArguments = login.length === 0;
    return takesZeroArguments;
  }
}
