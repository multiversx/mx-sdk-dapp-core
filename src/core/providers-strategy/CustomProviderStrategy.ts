import {
  ICustomProvider,
  IProvider,
  IProviderConfig,
  ProviderTypeEnum
} from 'core/providers/types/providerFactory.types';
import { ProviderError } from 'types';

export class CustomProviderStrategy {
  private provider: ICustomProvider<ProviderTypeEnum> | null = null;
  private type: ICustomProvider['type'] = '';
  private config: IProviderConfig = {};

  constructor({
    type,
    customProvider,
    config
  }: {
    type: ICustomProvider['type'];
    customProvider: ICustomProvider<ProviderTypeEnum>;
    config: IProviderConfig;
  }) {
    this.type = type;
    this.provider = customProvider;
    this.config = config;
  }

  public createProvider = async (): Promise<IProvider> => {
    if (this.provider?.type !== this.type) {
      throw new Error(
        `Provider type does not match. ${this.provider?.type} is different than ${this.type}.`
      );
    }

    return this.buildProvider();
  };

  private buildProvider = async () => {
    const provider = await this.provider?.constructor(this.config);

    if (!provider) {
      throw new Error(ProviderError.notInitialized);
    }

    return provider;
  };
}
