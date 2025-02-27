import { isServerTransactionPending } from 'store/actions/transactions/transactionStateByStatus';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { SignedTransactionType } from 'types/transactions.types';
import { getToastProceededStatus } from '../getToastProceededStatus';
import { createMockTransaction } from './mocks/mockTypes';

// Mock the transaction status checking function
jest.mock('store/actions/transactions/transactionStateByStatus', () => ({
  isServerTransactionPending: jest.fn()
}));

describe('getToastProceededStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default behavior for isServerTransactionPending
    (isServerTransactionPending as jest.Mock).mockImplementation(
      (status) => status === TransactionServerStatusesEnum.pending
    );
  });

  it('should return proper message for a single pending transaction', () => {
    const transactions = [
      createMockTransaction('tx-1', TransactionServerStatusesEnum.pending)
    ];

    (isServerTransactionPending as jest.Mock).mockReturnValue(true);

    const result = getToastProceededStatus(transactions);

    expect(result).toContain('0 / 1 transactions processed');
  });

  it('should return proper message for a single successful transaction', () => {
    const transactions = [
      createMockTransaction('tx-1', TransactionServerStatusesEnum.success)
    ];

    (isServerTransactionPending as jest.Mock).mockReturnValue(false);

    const result = getToastProceededStatus(transactions);

    expect(result).toContain('Transaction processed');
  });

  it('should return proper message for a single failed transaction', () => {
    const transactions = [
      createMockTransaction('tx-1', TransactionServerStatusesEnum.fail)
    ];

    (isServerTransactionPending as jest.Mock).mockReturnValue(false);

    const result = getToastProceededStatus(transactions);

    expect(result).toContain('Transaction processed');
  });

  it('should handle multiple transactions with all pending', () => {
    const transactions = [
      createMockTransaction('tx-1', TransactionServerStatusesEnum.pending),
      createMockTransaction('tx-2', TransactionServerStatusesEnum.pending)
    ];

    (isServerTransactionPending as jest.Mock).mockReturnValue(true);

    const result = getToastProceededStatus(transactions);

    expect(result).toContain('0 / 2 transactions processed');
  });

  it('should handle multiple transactions with all processed', () => {
    const transactions = [
      createMockTransaction('tx-1', TransactionServerStatusesEnum.success),
      createMockTransaction('tx-2', TransactionServerStatusesEnum.success)
    ];

    (isServerTransactionPending as jest.Mock).mockReturnValue(false);

    const result = getToastProceededStatus(transactions);

    expect(result).toContain('2 / 2 transactions processed');
  });

  it('should handle multiple transactions with mixed status', () => {
    const transactions = [
      createMockTransaction('tx-1', TransactionServerStatusesEnum.success),
      createMockTransaction('tx-2', TransactionServerStatusesEnum.pending)
    ];

    // Simulate one pending, one not pending
    (isServerTransactionPending as jest.Mock).mockImplementation(
      (status) => status === TransactionServerStatusesEnum.pending
    );

    const result = getToastProceededStatus(transactions);

    expect(result).toContain('1 / 2 transactions processed');
  });

  it('should handle multiple transactions with all types', () => {
    const transactions = [
      createMockTransaction('tx-1', TransactionServerStatusesEnum.success),
      createMockTransaction('tx-2', TransactionServerStatusesEnum.pending),
      createMockTransaction('tx-3', TransactionServerStatusesEnum.fail)
    ];

    // Simulate pending check based on status
    (isServerTransactionPending as jest.Mock).mockImplementation(
      (status) => status === TransactionServerStatusesEnum.pending
    );

    const result = getToastProceededStatus(transactions);

    expect(result).toContain('2 / 3 transactions processed');
  });

  it('should handle empty transactions array', () => {
    const transactions: SignedTransactionType[] = [];

    const result = getToastProceededStatus(transactions);

    expect(result).toContain('0 / 0 transactions processed');
  });

  it('should handle transactions without status', () => {
    // Create transaction without explicitly setting status
    const transactions = [
      { ...createMockTransaction('tx-1'), status: undefined }
    ];

    // Default behavior for undefined status
    (isServerTransactionPending as jest.Mock).mockReturnValue(true);

    const result = getToastProceededStatus(transactions);

    expect(result).toContain('0 / 1 transactions processed');
  });
});
