import { ITransactionListItem } from 'lib/sdkDappCoreUi';
import { isServerTransactionPending } from 'store/actions/transactions/transactionStateByStatus';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { getToastTransactionsStatus } from '../getToastTransactionsStatus';

jest.mock('store/actions/transactions/transactionStateByStatus', () => ({
  isServerTransactionPending: jest.fn()
}));

describe('getToastProceededStatus', () => {
  const baseTransaction: ITransactionListItem = {
    status: TransactionServerStatusesEnum.success,
    asset: null,
    action: { name: 'Transfer' },
    link: 'https://explorer.example.com/tx/123',
    hash: '123',
    details: {
      initiator: 'erd1...',
      directionLabel: 'To'
    },
    amount: '1 EGLD'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct message for single pending or completed transaction', () => {
    const pendingTx: ITransactionListItem = {
      ...baseTransaction,
      status: TransactionServerStatusesEnum.pending
    };

    const successTx: ITransactionListItem = {
      ...baseTransaction,
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
    const transactions: ITransactionListItem[] = [
      {
        ...baseTransaction,
        status: TransactionServerStatusesEnum.success
      },
      {
        ...baseTransaction,
        status: TransactionServerStatusesEnum.pending,
        hash: '456',
        link: 'https://explorer.example.com/tx/456'
      },
      {
        ...baseTransaction,
        status: TransactionServerStatusesEnum.fail,
        hash: '789',
        link: 'https://explorer.example.com/tx/789'
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
    const emptyTransactions: ITransactionListItem[] = [];
    const undefinedStatusTx: ITransactionListItem = {
      ...baseTransaction,
      status: undefined as unknown as TransactionServerStatusesEnum
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
