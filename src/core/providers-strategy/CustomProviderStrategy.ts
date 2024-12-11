import {
  ICustomProvider,
  IProvider,
  IProviderConfig,
  ProviderTypeEnum
} from 'core/providers/types/providerFactory.types';

export class CustomProviderStrategy {
  private provider: ICustomProvider<ProviderTypeEnum> | null = null;
  private type: string = '';
  private config: IProviderConfig = {};

  constructor(
    type: string,
    customProvider: ICustomProvider<ProviderTypeEnum>,
    config: IProviderConfig
  ) {
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
      throw new Error('Provider is not initialized');
    }

    provider.getType = this.getType;

    return provider;
  };

  private getType = () => {
    return this.type;
  };
}
