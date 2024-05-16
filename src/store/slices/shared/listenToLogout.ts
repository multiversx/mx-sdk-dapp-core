import { SharedActionsEnum } from 'store/actions/constants';
import { getListenToEvent } from 'store/helpers/eventHandlers';

export const listenToLogout = getListenToEvent<string | undefined>(
  SharedActionsEnum.LOGOUT
);
