import { NftEnumType, TransactionActionsEnum } from 'types';
import { DECIMALS } from 'constants/index';
import { getTransactionValue } from '../getTransactionValue';
import {
  ACTIONS_WITH_EGLD_VALUE,
  ACTIONS_WITH_MANDATORY_OPERATIONS,
  ACTIONS_WITH_VALUE_IN_DATA_FIELD
} from '../../../constants';

describe('getTransactionValue', () => {
  const baseTransaction = {
    fee: '1000000000000000',
    data: '',
    gasLimit: 50000,
    gasPrice: 1000000000,
    gasUsed: 50000,
    txHash: '0x123...abc',
    miniBlockHash: '0xabc...123',
    nonce: 42,
    receiver: 'erd1...receiver',
    receiverShard: 1,
    round: 100,
    sender: 'erd1...sender',
    senderShard: 0,
    signature: '0xdef...456',
    status: 'success',
    timestamp: Date.now(),
    value: '1000000000000000000',
    price: 1.5,
    transactionDetails: {
      method: 'transfer',
      transactionTokens: []
    },
    links: {
      senderLink: 'sender/address',
      receiverLink: 'receiver/address',
      senderShardLink: 'shard/0',
      receiverShardLink: 'shard/1',
      transactionLink: 'tx/hash'
    }
  };

  const baseAction = {
    category: 'transfer',
    name: TransactionActionsEnum.transfer,
    description: 'Token transfer action',
    arguments: {
      tokenId: 'TEST-123',
      amount: '1000000000000000000'
    }
  };

  test('returns EGLD value for actions in ACTIONS_WITH_EGLD_VALUE', () => {
    ACTIONS_WITH_EGLD_VALUE.forEach((actionName) => {
      const transaction = {
        ...baseTransaction,
        action: {
          ...baseAction,
          name: actionName
        }
      };

      const result = getTransactionValue({ transaction });

      expect(result).toEqual({
        egldValueData: {
          value: '1000000000000000000',
          formattedValue: '1',
          decimals: DECIMALS
        }
      });
    });
  });

  test('handles NFT transactions', () => {
    const mockNftToken = {
      type: NftEnumType.NonFungibleESDT,
      value: '1',
      decimals: 0,
      identifier: 'TEST-123-01'
    };

    const transaction = {
      ...baseTransaction,
      action: {
        ...baseAction,
        category: 'nft',
        arguments: {
          tokenId: mockNftToken.identifier,
          amount: mockNftToken.value
        }
      },
      tokens: [mockNftToken],
      tokenIdentifier: mockNftToken.identifier,
      tokenValue: mockNftToken.value
    };

    const result = getTransactionValue({ transaction });

    expect(result.nftValueData).toBeDefined();
    expect(result.nftValueData?.token).toEqual(mockNftToken);
    expect(result.nftValueData?.value).toBe('1');
    expect(result.nftValueData?.decimals).toBe(0);
  });

  test('handles fungible token transactions', () => {
    const mockToken = {
      type: 'FungibleESDT',
      value: '1000000000000000000',
      decimals: 18,
      identifier: 'TEST-123'
    };

    const transaction = {
      ...baseTransaction,
      action: {
        ...baseAction,
        category: 'esdt',
        arguments: {
          tokenId: mockToken.identifier,
          amount: mockToken.value
        }
      },
      tokens: [mockToken],
      tokenIdentifier: mockToken.identifier,
      tokenValue: mockToken.value,
      function: 'transfer',
      operations: [],
      results: []
    };

    const result = getTransactionValue({ transaction });

    expect(result.tokenValueData).toBeDefined();
    expect(result.tokenValueData?.token).toEqual(mockToken);
    expect(result.tokenValueData?.value).toBe('1000000000000000000');
    expect(result.tokenValueData?.decimals).toBe(18);
  });

  test('handles multiple tokens with titleText', () => {
    const mockTokens = [
      {
        type: 'FungibleESDT',
        value: '1000000000000000000',
        decimals: 18,
        identifier: 'TEST-123'
      },
      {
        type: 'FungibleESDT',
        value: '2000000000000000000',
        decimals: 18,
        identifier: 'TEST-456'
      }
    ];

    const transaction = {
      ...baseTransaction,
      action: {
        ...baseAction,
        category: 'multiToken',
        arguments: {
          tokens: mockTokens.map((token) => ({
            tokenId: token.identifier,
            amount: token.value
          }))
        }
      },
      tokens: mockTokens
    };

    const result = getTransactionValue({ transaction });

    expect(result.tokenValueData?.titleText).toBeDefined();
    expect(result.tokenValueData?.transactionTokens).toEqual(mockTokens);
  });

  test('handles actions with value in data field', () => {
    const transaction = {
      ...baseTransaction,
      action: {
        ...baseAction,
        name: ACTIONS_WITH_VALUE_IN_DATA_FIELD[0],
        category: 'transfer',
        arguments: {
          value: '2000000000000000000'
        }
      }
    };

    const result = getTransactionValue({ transaction });
    expect(result).toBeDefined();
  });

  test('handles actions with mandatory operations', () => {
    const transaction = {
      ...baseTransaction,
      action: {
        ...baseAction,
        name: ACTIONS_WITH_MANDATORY_OPERATIONS[0],
        category: 'operation',
        arguments: {
          operations: []
        }
      }
    };

    const result = getTransactionValue({ transaction });
    expect(result).toBeDefined();
  });
});
