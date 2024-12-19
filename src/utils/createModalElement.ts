import { IEventBus } from '@multiversx/sdk-dapp-core-ui/loader';
import { safeWindow } from 'constants/index';
import { defineCustomElements } from 'lib/sdkDappCoreUi';

export const createModalElement = async <
  T extends HTMLElement & { getEventBus: () => Promise<IEventBus | undefined> }
>(
  name: string
) => {
  // let eventBus: IEventBus | undefined;

  await defineCustomElements(safeWindow);

  const modalElement = document.createElement(name) as T;
  document.body.appendChild(modalElement);
  await customElements.whenDefined(name);

  // if (withEventBus) {
  //   eventBus = await modalElement.getEventBus();

  //   if (!eventBus) {
  //     throw new Error(`Event bus not provided for ${name}.`);
  //   }
  // }

  return modalElement;
};
