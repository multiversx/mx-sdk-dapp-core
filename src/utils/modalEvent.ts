import { IEventBus } from '@multiversx/sdk-dapp-core-ui/loader';
import { safeWindow } from 'constants/index';
import { defineCustomElements } from 'lib/sdkDappCoreUi';

export const getModalElement = async <
  T extends HTMLElement & { getEventBus: () => Promise<IEventBus | undefined> }
>(
  tagName: string
) => {
  await defineCustomElements(safeWindow);

  const modalElement = document.createElement(tagName) as T;
  document.body.appendChild(modalElement);
  await customElements.whenDefined(tagName);

  return modalElement;
};

export const getEventBus = async <
  T extends HTMLElement & { getEventBus: () => Promise<IEventBus | undefined> }
>(
  tagName: string
) => {
  const modalElement = await getModalElement<T>(tagName);
  document.body.appendChild(modalElement);
  await customElements.whenDefined(tagName);

  const eventBus = await modalElement.getEventBus();

  if (!eventBus) {
    throw new Error('Event bus not provided.');
  }

  return eventBus;
};
