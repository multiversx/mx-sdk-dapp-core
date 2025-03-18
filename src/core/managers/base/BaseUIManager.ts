import { UITagsEnum } from 'constants/UITags.enum';
import { IEventBus } from 'lib/sdkDappCoreUi';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement } from 'utils/createUIElement';
export abstract class BaseUIManager<TElement, TData, TEventEnum> {
  protected eventBus: IEventBus | null = null;
  protected uiElement: TElement | null = null;
  protected isCreatingElement = false;
  protected isOpen = false;
  protected anchor?: HTMLElement;

  // Data management
  protected abstract initialData: TData;
  protected data: TData;

  protected constructor() {
    this.data = this.getInitialData();
  }

  protected getInitialData(): TData {
    return this.initialData;
  }

  protected abstract getUIElementName(): UITagsEnum;

  public async init(anchor?: HTMLElement) {
    this.anchor = anchor;
    await this.createUIElement(anchor);
    await this.getEventBus();
    await this.setupEventListeners();
  }

  public async openUI(data: Partial<TData> = {}) {
    if (this.isOpen && this.uiElement) {
      return;
    }

    if (!this.uiElement) {
      await this.createUIElement();
    }

    if (!this.uiElement || !this.eventBus) {
      return;
    }

    this.data = { ...this.getInitialData(), ...data };
    this.isOpen = true;

    this.publishEvent(this.getOpenEventName());
    this.notifyDataUpdate();
  }

  protected publishEvent(event: TEventEnum, data?: TData) {
    if (!this.eventBus) {
      return;
    }

    this.eventBus.publish(event as unknown as string, data || this.data);
  }

  protected resetData(): void {
    this.data = this.getInitialData();
  }

  public closeAndReset(): void {
    if (!this.eventBus || !this.isOpen) {
      return;
    }

    this.data = { ...this.data, shouldClose: true } as unknown as TData;
    this.notifyDataUpdate();
    this.resetData();
    this.isOpen = false;

    this.publishEvent(this.getCloseEventName());
  }

  public updateData(newData: Partial<TData>): void {
    this.data = { ...this.data, ...newData };
    this.notifyDataUpdate();
  }

  protected notifyDataUpdate(): void {
    if (!this.eventBus) {
      return;
    }

    this.publishEvent(this.getDataUpdateEventName(), this.data);
  }

  public async getEventBus(): Promise<IEventBus | null> {
    if (!this.uiElement) {
      await this.createUIElement();
    }

    if (!this.uiElement) {
      return null;
    }

    if (!this.eventBus) {
      this.eventBus = await (this.uiElement as any).getEventBus();
    }

    if (!this.eventBus) {
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    return this.eventBus;
  }

  public async createUIElement(
    anchor: HTMLElement | undefined = this.anchor
  ): Promise<TElement | null> {
    if (this.uiElement) {
      return this.uiElement;
    }

    if (!this.isCreatingElement) {
      this.isCreatingElement = true;

      const options = anchor
        ? { name: this.getUIElementName(), anchor }
        : { name: this.getUIElementName() };

      const element = await createUIElement<TElement>(options);

      this.uiElement = element || null;
      await this.getEventBus();
      this.isCreatingElement = false;
    }

    if (!this.uiElement) {
      throw new Error(`Failed to create ${this.getUIElementName()} element`);
    }

    return this.uiElement;
  }

  protected abstract getOpenEventName(): TEventEnum;
  protected abstract getCloseEventName(): TEventEnum;
  protected abstract getDataUpdateEventName(): TEventEnum;
  protected abstract setupEventListeners(): Promise<void>;

  protected handleCloseUI(): void {
    this.isOpen = false;
    this.resetData();
  }

  public destroy() {
    if (this.eventBus) {
      this.eventBus.unsubscribe(
        this.getCloseEventName() as unknown as string,
        this.handleCloseUI.bind(this)
      );

      this.eventBus = null;
    }

    if (this.uiElement) {
      const parentElement = (this.uiElement as unknown as HTMLElement)
        .parentElement;

      if (parentElement) {
        parentElement.removeChild(this.uiElement as unknown as HTMLElement);
      }

      this.uiElement = null;
    }

    this.isOpen = false;
  }
}
