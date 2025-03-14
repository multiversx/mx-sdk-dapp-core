import { Transaction } from '@multiversx/sdk-core/out';
import { MultiSignTransactionType } from 'types/transactions.types';
import { TransactionDataTokenType } from 'types/transactions.types';
import { getCommonData, GetCommonDataPropsType } from '../getCommonData';
import { mockInputData } from './mockInputData';

describe('getCommonData', () => {
  it('should return the common data', async () => {
    const allTransactions: MultiSignTransactionType[] =
      mockInputData.allTransactions.map((tx) => ({
        ...tx,
        transaction: Transaction.fromPlainObject(tx.transaction)
      }));

    const parsedTransactionsByDataField =
      mockInputData.parsedTransactionsByDataField as Record<
        string,
        TransactionDataTokenType
      >;

    const mockData: GetCommonDataPropsType = {
      ...mockInputData,
      allTransactions,
      parsedTransactionsByDataField
    };

    const commonData = await getCommonData(mockData);
    expect(commonData).toBe(1);
  });
});
