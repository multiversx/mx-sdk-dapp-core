import { safeWindow } from '../../constants/window';

export function createCustomEvent<T>(eventName: string, eventData: T) {
  const event = new CustomEvent(eventName, { detail: eventData });
  safeWindow?.document.dispatchEvent(event);
}

// Function to listen to the custom event
export function listenToCustomEvent<T>(
  eventName: string,
  callback: (event: CustomEvent<T>) => void
) {
  safeWindow?.document.addEventListener(eventName, (evt) => {
    callback(evt as CustomEvent<T>);
  });
}
