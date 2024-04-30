import { StateCreator } from 'zustand';
import { SharedActionsEnum } from '../../actions/constants';
import { listenToCustomEvent } from '../../helpers/eventHandlers';

export const listenToLogout: <
  T extends (state: T, options?: { detail?: { message: string } }) => void
>(
  w: T
) => StateCreator<T, [], [], {}> = (wrapper) => (_set, get) => {
  listenToCustomEvent(
    SharedActionsEnum.LOGOUT,
    (event: CustomEvent<{ detail?: { message: string } }>) => {
      wrapper(get(), event.detail);
    }
  );
  return {};
};
