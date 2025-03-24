import { ITransactionListItem } from 'lib/sdkDappCoreUi';
import { TransactionServerStatusesEnum } from 'types';

export const baseTransactionMock: ITransactionListItem = {
  status: TransactionServerStatusesEnum.success,
  asset: null,
  action: { name: 'Transfer' },
  link: 'https://explorer.example.com/tx/123',
  hash: '123',
  details: {
    initiator: 'erd1...',
    directionLabel: 'To'
  },
  amount: '1 EGLD',
  timestamp: Date.now()
};
