import { IEventBus } from '@multiversx/sdk-dapp-core-ui/loader';
import { safeWindow } from 'constants/index';
import { defineCustomElements } from 'lib/sdkDappCoreUi';

//TODO: allow override createModalElement similar to accountProvider and add typed name for all webcomponents
export const createModalElement = async <
  T extends HTMLElement & {
    getEventBus: () => Promise<IEventBus | undefined>;
  },
>(
  name: string,
) => {
  await defineCustomElements(safeWindow);

  if (!safeWindow.document) {
    return {} as T;
  }

  const modalElement = safeWindow.document.createElement(name) as T;
  safeWindow.document.body.appendChild(modalElement);
  await customElements.whenDefined(name);

  return modalElement;
};
