import { createCustomEvent } from '../helpers/eventHandlers';
import { SharedActionsEnum } from './constants';

export const sharedActions = {
  // TODO: Implement the logout function params
  logout: () => {
    createCustomEvent(SharedActionsEnum.LOGOUT, { message: 'Logged out' });
  }
};
