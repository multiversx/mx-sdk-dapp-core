import { Transaction } from '@multiversx/sdk-core/out';
import { MultiSignTransactionType } from 'types/transactions.types';
import { TransactionDataTokenType } from 'types/transactions.types';
import { getCommonData, GetCommonDataPropsType } from '../getCommonData';
import { mockGetCommonDataInput } from './mockGetCommonDataInput';

const allTransactions: MultiSignTransactionType[] =
  mockGetCommonDataInput.allTransactions.map((tx) => ({
    ...tx,
    transaction: Transaction.fromPlainObject(tx.transaction)
  }));

const parsedTransactionsByDataField =
  mockGetCommonDataInput.parsedTransactionsByDataField as Record<
    string,
    TransactionDataTokenType
  >;

const mockData: GetCommonDataPropsType = {
  ...mockGetCommonDataInput,
  allTransactions,
  parsedTransactionsByDataField
};

describe('getCommonData', () => {
  it('should return the common data without ppu', async () => {
    const commonData = await getCommonData(mockData);

    expect(commonData).toStrictEqual({
      commonData: {
        currentIndex: 0,
        data: 'wrapEgld',
        egldLabel: 'xEGLD',
        feeInFiatLimit: '$0.0018',
        feeLimit: '0.0001',
        gasLimit: '4200000',
        gasPrice: '1000000000',
        highlight: null,
        isEditable: true,
        needsSigning: true,
        ppu: 0,
        ppuOptions: [],
        receiver:
          'erd1qqqqqqqqqqqqqpgqpv09kfzry5y4sj05udcngesat07umyj70n4sa2c0rp',
        scCall: null,
        tokenType: 'FungibleESDT',
        transactionsCount: 4
      },
      fungibleTransaction: null,
      tokenTransaction: {
        amount: '1.0000',
        identifier: 'xEGLD',
        usdValue: '≈ $17.82'
      }
    });
  });
});

describe('when the gas limit is updated', () => {
  const transactionsToModify: MultiSignTransactionType[] =
    mockGetCommonDataInput.allTransactions.map((tx) => ({
      ...tx,
      transaction: Transaction.fromPlainObject(tx.transaction)
    }));

  const updatedTransactions = [...transactionsToModify].map((tx, i) => {
    if (i === 0) {
      tx.transaction.gasLimit = BigInt(20_700_000);
      return tx;
    }
    tx.transaction.gasLimit = BigInt(520_000_000);
    return tx;
  });

  const networkWithGasStationMetadata = {
    ...mockData.network,
    gasStationMetadata: [
      {
        fast: 11_760_000,
        faster: 19_287_760
      },
      {
        fast: 11_760_000,
        faster: 19_287_760
      },
      {
        fast: 11_760_000,
        faster: 19_287_760
      }
    ]
  };

  it('should return the common data wit ppu for fist transaction', async () => {
    const commonData = await getCommonData({
      ...mockData,
      gasPriceData: {
        initialGasPrice: 1_000_000_000,
        ppu: 19_287_760
      },
      allTransactions: updatedTransactions,
      network: networkWithGasStationMetadata
    });

    expect(commonData).toStrictEqual({
      commonData: {
        currentIndex: 0,
        data: 'wrapEgld',
        egldLabel: 'xEGLD',
        feeInFiatLimit: '$0.0036',
        feeLimit: '0.0002',
        gasLimit: '20700000',
        gasPrice: '1455441207',
        highlight: null,
        isEditable: true,
        needsSigning: true,
        ppu: 19287760,
        ppuOptions: [
          {
            label: 'Standard',
            value: 0
          },
          {
            label: 'Faster',
            value: 19287760
          }
        ],
        receiver:
          'erd1qqqqqqqqqqqqqpgqpv09kfzry5y4sj05udcngesat07umyj70n4sa2c0rp',
        scCall: null,
        tokenType: 'FungibleESDT',
        transactionsCount: 4
      },
      fungibleTransaction: null,
      tokenTransaction: {
        amount: '1.0000',
        identifier: 'xEGLD',
        usdValue: '≈ $17.82'
      }
    });
  });

  it('should return the common data wit ppu for second transaction', async () => {
    const commonData = await getCommonData({
      ...mockData,
      currentScreenIndex: 3,
      gasPriceData: {
        initialGasPrice: 1000000000,
        ppu: 11_760_000
      },
      allTransactions: updatedTransactions,
      network: networkWithGasStationMetadata
    });

    expect(commonData).toStrictEqual({
      commonData: {
        currentIndex: 3,
        data: 'MultiESDTNFTTransfer@00000000000000000500139ed7ae4aa03792e6bcb332394a40fe746eefa47ceb@02@5745474c442d613238633539@@0de0b6b3a7640000@4d45582d613635396430@@e177704bc43f9bee3106@6164644c6971756964697479@0dbd2fc137a30000@df363e8872ed0d9235a7',
        egldLabel: 'xEGLD',
        feeInFiatLimit: '$0.0998',
        feeLimit: '0.0056',
        gasLimit: '520000000',
        gasPrice: '1069322720',
        highlight:
          '6164644c6971756964697479@0dbd2fc137a30000@df363e8872ed0d9235a7',
        isEditable: true,
        needsSigning: true,
        ppu: 11_760_000,
        ppuOptions: [
          {
            label: 'Standard',
            value: 0
          },
          {
            label: 'Fast',
            value: 11_760_000
          },
          {
            label: 'Faster',
            value: 19_287_760
          }
        ],
        receiver:
          'erd1dm9uxpf5awkn7uhju7zjn9lde0dhahy0qaxqqlu26xcuuw27qqrsqfmej3',
        scCall: 'addLiquidity',
        tokenType: 'FungibleESDT',
        transactionsCount: 4
      },
      fungibleTransaction: null,
      tokenTransaction: {
        amount: '0',
        identifier: 'xEGLD',
        usdValue: '= $0.00'
      }
    });
  });
});
