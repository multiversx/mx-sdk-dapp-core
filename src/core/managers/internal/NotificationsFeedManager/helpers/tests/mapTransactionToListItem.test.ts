import { TransactionServerStatusesEnum } from '@multiversx/sdk-dapp-core-ui/src/components/visual/transaction-list-item/transaction-list-item.types';
import { TransactionDirectionEnum } from 'types/serverTransactions.types';
import type { ServerTransactionType } from 'types/serverTransactions.types';
import { getInterpretedTransaction } from 'utils/transactions/getInterpretedTransaction';
import { getTransactionReceiver } from 'utils/transactions/getTransactionReceiver';
import { getTransactionTransferType } from 'utils/transactions/getTransactionTransferType';
import type { MapTransactionToListItemParamsType } from '../../types/transaction.types';
import { mapTransactionAssets } from '../mapTransactionAssets';
import { mapTransactionToListItem } from '../mapTransactionToListItem';

jest.mock('utils/transactions/getInterpretedTransaction');
jest.mock('utils/transactions/getTransactionReceiver');
jest.mock('utils/transactions/getTransactionTransferType');
jest.mock('../mapTransactionAssets');

describe('mapTransactionToListItem', () => {
  const mockTransaction: ServerTransactionType = {
    value: '1000000000000000000',
    sender: 'erd1sender',
    receiver: 'erd1receiver',
    data: '',
    tokenIdentifier: 'EGLD',
    gasLimit: 50000,
    gasPrice: 1000000000,
    gasUsed: 50000,
    txHash: 'hash1',
    miniBlockHash: 'block1',
    nonce: 1,
    round: 1,
    price: 1,
    status: TransactionServerStatusesEnum.success,
    timestamp: 123456789,
    receiverShard: 0,
    senderShard: 0,
    signature: 'sig1'
  };

  const mockParams: MapTransactionToListItemParamsType = {
    transaction: mockTransaction,
    address: 'erd1user',
    explorerAddress: 'https://explorer.example.com',
    egldLabel: 'xEGLD'
  };

  const mockInterpretedTx = {
    transactionDetails: {
      method: {
        name: 'transfer'
      }
    }
  };

  const mockAssets = {
    mainIconUrl: 'http://example.com/main.svg',
    rightIcons: ['http://example.com/token1.svg'],
    initiatorIconUrl: 'http://example.com/initiator.svg'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getInterpretedTransaction as jest.Mock).mockReturnValue(mockInterpretedTx);
    (getTransactionReceiver as jest.Mock).mockReturnValue(
      mockParams.transaction.receiver
    );
    (mapTransactionAssets as jest.Mock).mockReturnValue(mockAssets);
  });

  it('should map incoming transaction correctly', () => {
    (getTransactionTransferType as jest.Mock).mockReturnValue(
      TransactionDirectionEnum.IN
    );

    const result = mapTransactionToListItem(mockParams);

    expect(result).toEqual({
      title: 'transfer',
      amount: '+1000000000000000000 EGLD',
      mainIconUrl: 'http://example.com/main.svg',
      details: {
        directionLabel: 'From',
        initiator: mockParams.transaction.sender,
        iconUrl: 'http://example.com/initiator.svg'
      },
      rightIcons: ['http://example.com/token1.svg']
    });

    expect(getInterpretedTransaction).toHaveBeenCalledWith({
      transaction: mockParams.transaction,
      address: mockParams.address,
      explorerAddress: mockParams.explorerAddress
    });
  });

  it('should map outgoing transaction correctly', () => {
    (getTransactionTransferType as jest.Mock).mockReturnValue(
      TransactionDirectionEnum.OUT
    );

    const result = mapTransactionToListItem(mockParams);

    expect(result).toEqual({
      title: 'transfer',
      amount: '-1000000000000000000 EGLD',
      mainIconUrl: 'http://example.com/main.svg',
      details: {
        directionLabel: 'To',
        initiator: mockParams.transaction.receiver,
        iconUrl: 'http://example.com/initiator.svg'
      },
      rightIcons: ['http://example.com/token1.svg']
    });
  });

  it('should use egldLabel when tokenIdentifier is not present', () => {
    (getTransactionTransferType as jest.Mock).mockReturnValue(
      TransactionDirectionEnum.OUT
    );
    const paramsWithoutToken: MapTransactionToListItemParamsType = {
      ...mockParams,
      transaction: {
        ...mockTransaction,
        tokenIdentifier: undefined
      }
    };

    const result = mapTransactionToListItem(paramsWithoutToken);

    expect(result.amount).toBe('-1000000000000000000 xEGLD');
  });

  it('should handle transaction with no value', () => {
    const paramsWithoutValue: MapTransactionToListItemParamsType = {
      ...mockParams,
      transaction: {
        ...mockTransaction,
        value: ''
      }
    };

    const result = mapTransactionToListItem(paramsWithoutValue);

    expect(result.amount).toBe('');
  });
});
