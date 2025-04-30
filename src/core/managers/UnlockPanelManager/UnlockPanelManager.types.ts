import {
  IProviderFactory,
  ProviderTypeEnum
} from 'core/providers/types/providerFactory.types';

export enum UnlockPanelEventsEnum {
  OPEN = 'OPEN',
  CLOSE = 'CLOSE',
  LOGIN = 'LOGIN',
  CANCEL_LOGIN = 'CANCEL_LOGIN'
}

export interface IUnlockPanel {
  isOpen: boolean;
  allowedProviders?: ProviderTypeEnum[] | null;
}

/**
 * Handle the full login process
 * @example
 * ```ts
    async ({ type, anchor }: IProviderFactory) => {
      const provider = await ProviderFactory.create({
        type,
        anchor
      });
      await provider?.login();
      navigate('/dashboard');
    };
 *  ```
 */
type LoginFunctonType = ({ type, anchor }: IProviderFactory) => Promise<void>;

/**
 * Callback to be executed after login is performed
 * @example
 * ```ts
    () => {
      navigate('/dashboard');
    };
 *  ```
 */
type LoginCallbackType = () => void;

export type LoginType = LoginFunctonType | LoginCallbackType;
