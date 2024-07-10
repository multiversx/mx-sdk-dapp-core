import { safeWindow } from 'constants/window';
import { SharedActionsEnum } from 'store/actions';
import { StateCreator } from 'zustand/vanilla';

export function createCustomEvent<T>(eventName: string, eventData: T) {
  const event = new CustomEvent(eventName, { detail: eventData });
  safeWindow?.document.dispatchEvent(event);
}

function listenToCustomEvent<T>(
  eventName: string,
  callback: (event: CustomEvent<T>) => void
) {
  safeWindow?.document.addEventListener(eventName, (evt) => {
    callback(evt as CustomEvent<T>);
  });
}

type ListenToCustomEventType<K> = <
  T extends (state: T, options: { detail: K }) => void
>(
  w: T
) => StateCreator<T, [], [], Record<string, unknown>>;

export const getListenToEvent =
  <T>(action: SharedActionsEnum): ListenToCustomEventType<T> =>
  (wrapper) =>
  (_set, get) => {
    listenToCustomEvent(action, (event: CustomEvent<{ detail: T }>) => {
      wrapper(get(), event.detail);
    });
    return {};
  };
