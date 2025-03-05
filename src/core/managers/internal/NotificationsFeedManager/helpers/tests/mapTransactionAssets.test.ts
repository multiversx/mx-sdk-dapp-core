import { TransactionServerStatusesEnum } from '@multiversx/sdk-dapp-core-ui/src/components/visual/transaction-list-item/transaction-list-item.types';
import type { ServerTransactionType } from 'types/serverTransactions.types';
import { getTransactionTokens } from 'utils/transactions/getTransactionTokens';
import { mapTransactionAssets } from '../mapTransactionAssets';

jest.mock('utils/transactions/getTransactionTokens');

describe('mapTransactionAssets', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle single token transaction', () => {
    const mockToken = { svgUrl: 'http://example.com/token1.svg' };
    (getTransactionTokens as jest.Mock).mockReturnValue([mockToken]);

    const result = mapTransactionAssets(mockTransaction);

    expect(result).toEqual({
      mainIconUrl: 'http://example.com/token1.svg',
      rightIcons: ['http://example.com/token1.svg'],
      initiatorIconUrl: ''
    });
    expect(getTransactionTokens).toHaveBeenCalledWith(mockTransaction);
  });

  it('should handle multiple tokens transaction', () => {
    const mockTokens = [
      { svgUrl: 'http://example.com/token1.svg' },
      { svgUrl: 'http://example.com/token2.svg' }
    ];
    (getTransactionTokens as jest.Mock).mockReturnValue(mockTokens);

    const result = mapTransactionAssets(mockTransaction);

    expect(result).toEqual({
      mainIconUrl: undefined,
      rightIcons: [
        'http://example.com/token1.svg',
        'http://example.com/token2.svg'
      ],
      initiatorIconUrl: ''
    });
    expect(getTransactionTokens).toHaveBeenCalledWith(mockTransaction);
  });

  it('should handle transaction with no tokens', () => {
    (getTransactionTokens as jest.Mock).mockReturnValue([]);

    const result = mapTransactionAssets(mockTransaction);

    expect(result).toEqual({
      mainIconUrl: undefined,
      rightIcons: [],
      initiatorIconUrl: ''
    });
    expect(getTransactionTokens).toHaveBeenCalledWith(mockTransaction);
  });

  it('should filter out undefined svgUrls', () => {
    const mockTokens = [
      { svgUrl: 'http://example.com/token1.svg' },
      { svgUrl: undefined },
      { svgUrl: 'http://example.com/token3.svg' }
    ];
    (getTransactionTokens as jest.Mock).mockReturnValue(mockTokens);

    const result = mapTransactionAssets(mockTransaction);

    expect(result).toEqual({
      mainIconUrl: undefined,
      rightIcons: [
        'http://example.com/token1.svg',
        'http://example.com/token3.svg'
      ],
      initiatorIconUrl: ''
    });
    expect(getTransactionTokens).toHaveBeenCalledWith(mockTransaction);
  });
});
