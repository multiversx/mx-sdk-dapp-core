import { Address } from '@multiversx/sdk-core/out';
import { getStore } from '../../store';
import { resetStore } from 'store/middleware/logoutMiddleware';
import { ProviderTypeEnum } from 'core/providers/types/providerFactory.types';

export const logoutAction = () => getStore().setState(resetStore);
export interface LoginActionPayloadType {
  address: string;
  providerType: ProviderTypeEnum;
}

export const loginAction = ({
  address,
  providerType
}: LoginActionPayloadType) =>
  getStore().setState(({ account, loginInfo }) => {
    account.address = address;
    account.publicKey = new Address(address).hex();

    if (loginInfo) {
      loginInfo.providerType = providerType;
    }
  });
