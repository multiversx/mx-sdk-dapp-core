import { SharedActionsEnum } from 'store/actions/constants';
import { getListenToEvent } from 'store/helpers/eventHandlers';
import { LoginMethodsEnum } from 'types/enums.types';

export interface LoginActionPayloadType {
  address: string;
  loginMethod: LoginMethodsEnum;
}

export const listenToLogin = getListenToEvent<LoginActionPayloadType>(
  SharedActionsEnum.LOGIN
);
