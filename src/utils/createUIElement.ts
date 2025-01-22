import { IEventBus } from '@multiversx/sdk-dapp-core-ui/loader';
import { safeWindow } from 'constants/index';
import { defineCustomElements } from 'lib/sdkDappCoreUi';

export interface CreateEventBusUIElementType extends HTMLElement {
  getEventBus: () => Promise<IEventBus | undefined>;
}

export const createUIElement = async <T = CreateEventBusUIElementType>(
  name: string
) => {
  await defineCustomElements(safeWindow);

  if (!safeWindow.document) {
    return {} as T;
  }

  const element = safeWindow.document.createElement(name);
  safeWindow.document.body.appendChild(element);
  await customElements.whenDefined(name);

  return element as T;
};
