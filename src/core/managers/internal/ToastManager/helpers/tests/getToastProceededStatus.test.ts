import { testAddress } from '__mocks__/accountConfig';
import { isServerTransactionPending } from 'store/actions/transactions/transactionStateByStatus';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { SignedTransactionType } from 'types/transactions.types';
import { getToastProceededStatus } from '../getToastProceededStatus';

jest.mock('store/actions/transactions/transactionStateByStatus', () => ({
  isServerTransactionPending: jest.fn()
}));

describe('getToastProceededStatus', () => {
  const baseTransaction: Omit<SignedTransactionType, 'status' | 'hash'> = {
    nonce: 1,
    value: '1000000000000000000',
    receiver: testAddress,
    sender: testAddress,
    gasPrice: 1000000000,
    gasLimit: 50000,
    data: 'data',
    chainID: '1',
    version: 1,
    options: 0
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct message for single pending or completed transaction', () => {
    const pendingTx: SignedTransactionType = {
      ...baseTransaction,
      hash: 'tx1',
      status: TransactionServerStatusesEnum.pending
    };

    const successTx: SignedTransactionType = {
      ...baseTransaction,
      hash: 'tx2',
      status: TransactionServerStatusesEnum.success
    };

    (isServerTransactionPending as jest.Mock).mockImplementation(
      (status) => status === TransactionServerStatusesEnum.pending
    );

    expect(getToastProceededStatus([pendingTx])).toBe(
      '0 / 1 transactions processed'
    );

    expect(getToastProceededStatus([successTx])).toBe('Transaction processed');
  });

  it('should show fraction of completed transactions when handling multiple transactions with mixed states', () => {
    const transactions: SignedTransactionType[] = [
      {
        ...baseTransaction,
        hash: 'tx1',
        status: TransactionServerStatusesEnum.success
      },
      {
        ...baseTransaction,
        hash: 'tx2',
        status: TransactionServerStatusesEnum.pending
      },
      {
        ...baseTransaction,
        hash: 'tx3',
        status: TransactionServerStatusesEnum.fail
      }
    ];

    (isServerTransactionPending as jest.Mock).mockImplementation(
      (status) => status === TransactionServerStatusesEnum.pending
    );

    expect(getToastProceededStatus(transactions)).toBe(
      '2 / 3 transactions processed'
    );
  });

  it('should handle empty array and transactions with undefined status', () => {
    const emptyTransactions: SignedTransactionType[] = [];
    const undefinedStatusTx: SignedTransactionType = {
      ...baseTransaction,
      hash: 'tx1'
    };

    (isServerTransactionPending as jest.Mock).mockReturnValue(true);

    expect(getToastProceededStatus(emptyTransactions)).toBe(
      '0 / 0 transactions processed'
    );

    expect(getToastProceededStatus([undefinedStatusTx])).toBe(
      '0 / 1 transactions processed'
    );
  });
});
