import { defineCustomElements } from '@multiversx/sdk-dapp-core-ui/loader';
import { safeWindow } from 'constants/index';
import { IEventBus } from '../types/providerFactory.types';

// Retrieve eventBus from webcomponent
export async function getEventBus<T extends HTMLElement>(
  tagName: string
): Promise<IEventBus> {
  const existingModal = document.querySelector(tagName);
  if (existingModal) {
    existingModal.remove();
  }

  defineCustomElements(safeWindow);

  const modalElement = document.createElement(tagName) as T;

  document.body.appendChild(modalElement);
  console.log(`${tagName} element appended:`, { modalElement });

  return new Promise<IEventBus>((resolve, reject) => {
    // Check every 100ms if component has been mounted
    const checkInitialization = setInterval(async () => {
      try {
        const eventBus = await (modalElement as any).getEventBus();
        clearInterval(checkInitialization);
        resolve(eventBus);
      } catch (error) {
        console.error('Error getting event bus:', error);
        if (!document.body.contains(modalElement)) {
          clearInterval(checkInitialization);
          reject(new Error(`${tagName} was removed before initialization.`));
        }
      }
    }, 100);
  });
}
