import { UITagsEnum } from 'constants/UITags.enum';
import { IEventBus } from 'lib/sdkDappCoreUi';
import { ProviderErrorsEnum } from 'types/provider.types';
import { createUIElement } from 'utils/createUIElement';

interface IUIElement {
  getEventBus: () => Promise<IEventBus | null>;
}

export abstract class SidePanelBaseManager<TElement, TData, TEventEnum> {
  protected eventBus: IEventBus | null = null;
  protected uiElement: TElement | null = null;
  protected isCreatingElement = false;
  protected isOpen = false;
  protected anchor?: HTMLElement;

  protected abstract initialData: TData;
  protected data: TData;

  constructor() {
    this.data = this.getInitialData();
  }

  public async init(anchor?: HTMLElement) {
    this.anchor = anchor;
    await this.createUIElement(anchor);
    await this.getEventBus();
    await this.setupEventListeners();
  }

  public async openUI(data: Partial<TData> = {}) {
    if (this.isOpen && this.uiElement) {
      // UI element is already open
      return;
    }

    if (!this.uiElement) {
      // Try to create the UI element again
      await this.createUIElement();
    }

    if (!this.uiElement) {
      // The UI element failed to be created
      throw new Error(`Failed to create ${this.getUIElementName()} element`);
    }

    if (!this.eventBus) {
      // Try to get the event bus from the UI element again
      await this.getEventBus();
    }

    if (!this.eventBus) {
      // The event bus failed to be retrieved
      throw new Error(ProviderErrorsEnum.eventBusError);
    }

    const initialData = this.getInitialData();

    if (Object.keys(data).length === 0) {
      this.data = initialData;
    } else if (Array.isArray(data) && Array.isArray(initialData)) {
      this.updateDataArray([...initialData, ...data]);
    } else {
      this.data = { ...initialData, ...data };
    }

    this.isOpen = true;
    this.publishEvent(this.getOpenEventName());
    this.notifyDataUpdate();
  }

  public closeAndReset(): void {
    if (!this.eventBus || !this.isOpen) {
      return;
    }

    if (!Array.isArray(this.data)) {
      this.data = { ...this.data, shouldClose: true } as unknown as TData;
    }

    this.notifyDataUpdate();
    this.resetData();
    this.isOpen = false;

    this.publishEvent(this.getCloseEventName());
  }

  public updateData(newData: Partial<TData>): void {
    if (Array.isArray(newData)) {
      this.updateDataArray(newData);
    } else {
      this.data = { ...this.data, ...newData };
    }

    this.notifyDataUpdate();
  }

  public async getEventBus(): Promise<IEventBus | null> {
    if (!this.uiElement) {
      // Try to create the UI element again
      await this.createUIElement();
    }

    if (!this.uiElement) {
      // The UI element failed to be created
      throw new Error(`Failed to create ${this.getUIElementName()} element`);
    }

    if (!this.eventBus) {
      // Try to get the event bus from the UI element again
      this.eventBus = await (
        this.uiElement as unknown as IUIElement
      ).getEventBus();
    }

    if (!this.eventBus) {
      // The event bus failed to be retrieved
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

  protected getInitialData(): TData {
    return this.initialData;
  }

  protected publishEvent(event: TEventEnum, data?: TData | TData[]) {
    if (!this.eventBus) {
      return;
    }

    this.eventBus.publish(event as unknown as string, data || this.data);
  }

  protected resetData(): void {
    this.data = this.getInitialData();
  }

  protected notifyDataUpdate(): void {
    if (!this.eventBus) {
      return;
    }

    this.publishEvent(this.getDataUpdateEventName(), this.data);
  }

  protected handleCloseUI(): void {
    this.isOpen = false;
    this.resetData();
  }

  protected abstract getUIElementName(): UITagsEnum;
  protected abstract getOpenEventName(): TEventEnum;
  protected abstract getCloseEventName(): TEventEnum;
  protected abstract getDataUpdateEventName(): TEventEnum;
  protected abstract setupEventListeners(): Promise<void>;

  private updateDataArray(newData: TData[]): void {
    this.data = [...newData] as unknown as TData;
  }
}
