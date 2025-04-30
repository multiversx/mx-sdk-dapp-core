import { ProviderErrorsEnum } from 'types/provider.types';
import { IProviderAccount } from '@multiversx/sdk-wallet-connect-provider/out';
import { getAddress } from 'core/methods/account/getAddress';

export type LoginOptionsTypes = {
  addressIndex?: number;
  callbackUrl?: string;
  token?: string;
};

export abstract class BaseProviderStrategy {
  protected address: string = '';
  protected _login:
    | ((options?: LoginOptionsTypes) => Promise<IProviderAccount | null>)
    | null = null;
  protected loginAbortController: AbortController | null = null;

  constructor(address?: string) {
    this.address = address || '';
  }

  public login = async (options?: LoginOptionsTypes) => {
    if (!this._login) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    this.cancelLogin();

    if (this.loginAbortController) {
      this.loginAbortController.abort();
    }

    const controller = new AbortController();
    this.loginAbortController = controller;

    const signal = controller.signal;

    try {
      const abortPromise = new Promise<never>((_, reject) => {
        signal.addEventListener('abort', () => {
          reject(new Error('Login cancelled'));
        });
      });

      const { address, signature } = await Promise.race([
        this.getLoginOperation(options),
        abortPromise
      ]);

      this.loginAbortController = null;

      return { address, signature };
    } catch (error) {
      this.loginAbortController = null;
      throw error;
    }
  };

  public cancelLogin = () => {
    if (this.loginAbortController) {
      this.loginAbortController.abort();
    }

    this.cancelAction();
    this.loginAbortController = null;
  };

  protected getLoginOperation = async (
    options?: LoginOptionsTypes
  ): Promise<IProviderAccount> => {
    if (!this._login) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    const result = await this._login(options);

    if (!result?.address) {
      throw new Error(ProviderErrorsEnum.notInitialized);
    }

    return {
      address: result.address,
      signature: result.signature ?? ''
    };
  };

  protected initialize = () => {
    if (this.address) {
      return;
    }

    const address = getAddress();
    if (!address) {
      return;
    }

    this.address = address;
  };

  protected cancelAction() {
    return;
  }
}
