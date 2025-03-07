import { testAddress } from '__mocks__/accountConfig';
import { isServerTransactionPending } from 'store/actions/transactions/transactionStateByStatus';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { ISignedTransaction } from 'types/transactions.types';
import { getToastTransactionsStatus } from '../getToastTransactionsStatus';

jest.mock('store/actions/transactions/transactionStateByStatus', () => ({
  isServerTransactionPending: jest.fn()
}));

describe('getToastProceededStatus', () => {
  const baseTransaction: Omit<ISignedTransaction, 'status' | 'hash'> = {
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
    const pendingTx: ISignedTransaction = {
      ...baseTransaction,
      hash: 'tx1',
      status: TransactionServerStatusesEnum.pending
    };

    const successTx: ISignedTransaction = {
      ...baseTransaction,
      hash: 'tx2',
      status: TransactionServerStatusesEnum.success
    };

    (isServerTransactionPending as jest.Mock).mockImplementation(
      (status) => status === TransactionServerStatusesEnum.pending
    );

    expect(getToastTransactionsStatus([pendingTx])).toBe(
      '0 / 1 transactions processed'
    );

    expect(getToastTransactionsStatus([successTx])).toBe(
      'Transaction processed'
    );
  });

  it('should show fraction of completed transactions when handling multiple transactions with mixed states', () => {
    const transactions: ISignedTransaction[] = [
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

    expect(getToastTransactionsStatus(transactions)).toBe(
      '2 / 3 transactions processed'
    );
  });

  it('should handle empty array and transactions with undefined status', () => {
    const emptyTransactions: ISignedTransaction[] = [];
    const undefinedStatusTx: ISignedTransaction = {
      ...baseTransaction,
      hash: 'tx1'
    };

    (isServerTransactionPending as jest.Mock).mockReturnValue(true);

    expect(getToastTransactionsStatus(emptyTransactions)).toBe(
      '0 / 0 transactions processed'
    );

    expect(getToastTransactionsStatus([undefinedStatusTx])).toBe(
      '0 / 1 transactions processed'
    );
  });
});
