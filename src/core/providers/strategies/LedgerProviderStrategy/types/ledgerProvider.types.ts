import { IProviderAccount } from '@multiversx/sdk-wallet-connect-provider/out';
import { LedgerConnectStateManager } from 'core/managers';
import { IEventBus } from 'types/manager.types';
import { ILedgerConnectModalData } from './ledger.types';

export type LedgerConfigType = {
  version: string;
  dataEnabled: boolean;
};

export type LedgerConnectStateManagerType = LedgerConnectStateManager<
  IEventBus<ILedgerConnectModalData>
>;

export type LedgerEventBusType = IEventBus<ILedgerConnectModalData>;

export type LedgerLoginType = (options?: {
  addressIndex: number;
}) => Promise<IProviderAccount>;
