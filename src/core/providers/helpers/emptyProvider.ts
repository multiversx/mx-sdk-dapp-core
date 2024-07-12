import { SignableMessage, Transaction } from '@multiversx/sdk-core';
import { IDappProvider } from 'types';
import { EngineTypes } from 'utils/walletconnect/__sdkWalletconnectProvider';

export const DAPP_INIT_ROUTE = '/dapp/init';

const notInitializedError = (caller: string) => {
  return `Unable to perform ${caller}, Provider not initialized`;
};

export class EmptyProvider implements IDappProvider {
  init(): Promise<boolean> {
    return Promise.resolve(false);
  }

  login<TOptions = { callbackUrl?: string } | undefined, TResponse = string>(
    options?: TOptions
  ): Promise<TResponse> {
    throw new Error(notInitializedError(`login with options: ${options}`));
  }

  logout<TOptions = { callbackUrl?: string }, TResponse = boolean>(
    options?: TOptions
  ): Promise<TResponse> {
    throw new Error(notInitializedError(`logout with options: ${options}`));
  }

  getAddress(): Promise<string> {
    throw new Error(notInitializedError('getAddress'));
  }

  isInitialized(): boolean {
    return false;
  }

  isConnected(): Promise<boolean> {
    return Promise.resolve(false);
  }

  sendTransaction?<
    TOptions = { callbackUrl?: string },
    TResponse = Transaction
  >(transaction: Transaction, options?: TOptions): Promise<TResponse> {
    throw new Error(
      notInitializedError(
        `sendTransaction with transactions: ${transaction} options: ${options}`
      )
    );
  }

  signTransaction<TOptions = { callbackUrl?: string }, TResponse = Transaction>(
    transaction: Transaction,
    options?: TOptions
  ): Promise<TResponse> {
    throw new Error(
      notInitializedError(
        `signTransaction with transactions: ${transaction} options: ${options}`
      )
    );
  }

  signTransactions<TOptions = { callbackUrl?: string }, TResponse = []>(
    transactions: [],
    options?: TOptions
  ): Promise<TResponse> {
    throw new Error(
      notInitializedError(
        `signTransactions with transactions: ${transactions} options: ${options}`
      )
    );
  }

  signMessage<T extends SignableMessage, TOptions = { callbackUrl?: string }>(
    message: T,
    options: TOptions
  ): Promise<T> {
    throw new Error(
      notInitializedError(
        `signTransactions with ${message} and options ${options}`
      )
    );
  }

  sendCustomMessage?({
    method,
    params
  }: {
    method: string;
    params: any;
  }): Promise<any> {
    throw new Error(
      notInitializedError(
        `sendCustomMessage with method: ${method} params: ${params}`
      )
    );
  }

  sendCustomRequest?(options?: {
    request: EngineTypes.RequestParams['request'];
  }): Promise<any> {
    throw new Error(
      notInitializedError(`sendSessionEvent with options: ${options}`)
    );
  }

  ping?(): Promise<boolean> {
    return Promise.resolve(false);
  }
}

export const emptyProvider = new EmptyProvider();
