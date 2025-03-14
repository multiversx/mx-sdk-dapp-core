import { Transaction } from '@multiversx/sdk-core/out';
import { MultiSignTransactionType } from 'types/transactions.types';
import { TransactionDataTokenType } from 'types/transactions.types';
import { getCommonData, GetCommonDataPropsType } from '../getCommonData';
import { mockGetCommonDataInput } from './mockGetCommonDataInput';

describe('getCommonData', () => {
  it('should return the common data', async () => {
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
        gasPriceMultiplier: 1,
        highlight: null,
        isEditable: true,
        needsSigning: true,
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
