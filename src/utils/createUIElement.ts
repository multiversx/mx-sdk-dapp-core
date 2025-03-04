import { IEventBus } from '@multiversx/sdk-dapp-core-ui/loader';
import { safeWindow } from 'constants/index';
import { SdkDappCoreUiTagsEnum } from 'constants/sdkDappCoreUiTags';
import { defineCustomElements } from 'lib/sdkDappCoreUi';

export interface CreateEventBusUIElementType extends HTMLElement {
  getEventBus: () => Promise<IEventBus | undefined>;
}

export const createUIElement = async <T = CreateEventBusUIElementType>({
  name,
  anchor
}: {
  name: SdkDappCoreUiTagsEnum;
  anchor?: HTMLElement;
}) => {
  await defineCustomElements(safeWindow);

  if (!safeWindow.document) {
    return {} as T;
  }

  const element = safeWindow.document.createElement(name);
  const rootElement = anchor || safeWindow.document.body;
  rootElement.appendChild(element);
  await customElements.whenDefined(name);

  return element as T;
};
