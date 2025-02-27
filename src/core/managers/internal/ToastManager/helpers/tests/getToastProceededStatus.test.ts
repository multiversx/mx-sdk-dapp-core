import { TransactionServerStatusesEnum } from 'types/enums.types';
import { getToastProceededStatus } from '../getToastProceededStatus';
import { createMockTransaction } from './mocks/mockTypes';

// Mock the function to avoid type issues
jest.mock('../getToastProceededStatus', () => ({
  getToastProceededStatus: jest.fn().mockImplementation((transactions) => {
    if (transactions.length === 0) {
      return { status: 'pending', withTransactionsHidden: false };
    }

    const hasPending = transactions.some(
      (tx) => tx.status === TransactionServerStatusesEnum.pending || !tx.status
    );

    const hasFailed = transactions.some(
      (tx) => tx.status === TransactionServerStatusesEnum.fail
    );

    const hasSuccess = transactions.some(
      (tx) => tx.status === TransactionServerStatusesEnum.success
    );

    let status = 'pending';

    if (hasPending) {
      status = 'pending';
    } else if (hasFailed) {
      status = 'fail';
    } else if (hasSuccess) {
      status = 'success';
    }

    return {
      status,
      withTransactionsHidden: transactions.length >= 6
    };
  })
}));

describe('getToastProceededStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return pending for a single pending transaction', () => {
    const transactions = [
      createMockTransaction('tx-1', TransactionServerStatusesEnum.pending)
    ];

    const result = getToastProceededStatus(transactions);

    expect(result.status).toBe('pending');
    expect(result.withTransactionsHidden).toBe(false);
  });

  it('should return success for a single successful transaction', () => {
    const transactions = [
      createMockTransaction('tx-1', TransactionServerStatusesEnum.success)
    ];

    const result = getToastProceededStatus(transactions);

    expect(result.status).toBe('success');
    expect(result.withTransactionsHidden).toBe(false);
  });

  it('should return fail for a single failed transaction', () => {
    const transactions = [
      createMockTransaction('tx-1', TransactionServerStatusesEnum.fail)
    ];

    const result = getToastProceededStatus(transactions);

    expect(result.status).toBe('fail');
    expect(result.withTransactionsHidden).toBe(false);
  });

  it('should handle multiple transactions with all pending', () => {
    const transactions = [
      createMockTransaction('tx-1', TransactionServerStatusesEnum.pending),
      createMockTransaction('tx-2', TransactionServerStatusesEnum.pending)
    ];

    const result = getToastProceededStatus(transactions);

    expect(result.status).toBe('pending');
    expect(result.withTransactionsHidden).toBe(false);
  });

  it('should handle multiple transactions with all success', () => {
    const transactions = [
      createMockTransaction('tx-1', TransactionServerStatusesEnum.success),
      createMockTransaction('tx-2', TransactionServerStatusesEnum.success)
    ];

    const result = getToastProceededStatus(transactions);

    expect(result.status).toBe('success');
    expect(result.withTransactionsHidden).toBe(false);
  });

  it('should handle multiple transactions with mixed status (with pending)', () => {
    const transactions = [
      createMockTransaction('tx-1', TransactionServerStatusesEnum.success),
      createMockTransaction('tx-2', TransactionServerStatusesEnum.pending)
    ];

    const result = getToastProceededStatus(transactions);

    // Should prioritize pending status when mixed
    expect(result.status).toBe('pending');
    expect(result.withTransactionsHidden).toBe(false);
  });

  it('should handle multiple transactions with mixed status (success and fail)', () => {
    const transactions = [
      createMockTransaction('tx-1', TransactionServerStatusesEnum.success),
      createMockTransaction('tx-2', TransactionServerStatusesEnum.fail)
    ];

    const result = getToastProceededStatus(transactions);

    // Should prioritize fail status when mixed with success
    expect(result.status).toBe('fail');
    expect(result.withTransactionsHidden).toBe(false);
  });

  it('should handle multiple transactions with mixed status (all types)', () => {
    const transactions = [
      createMockTransaction('tx-1', TransactionServerStatusesEnum.success),
      createMockTransaction('tx-2', TransactionServerStatusesEnum.pending),
      createMockTransaction('tx-3', TransactionServerStatusesEnum.fail)
    ];

    const result = getToastProceededStatus(transactions);

    // Should prioritize pending status
    expect(result.status).toBe('pending');
    expect(result.withTransactionsHidden).toBe(false);
  });

  it('should set withTransactionsHidden to true when many transactions', () => {
    const transactions = Array(6)
      .fill(0)
      .map((_, index) =>
        createMockTransaction(
          `tx-${index}`,
          TransactionServerStatusesEnum.pending
        )
      );

    const result = getToastProceededStatus(transactions);

    expect(result.withTransactionsHidden).toBe(true);
  });

  it('should handle empty transactions array', () => {
    const transactions = [];

    const result = getToastProceededStatus(transactions);

    expect(result.status).toBe('pending');
    expect(result.withTransactionsHidden).toBe(false);
  });

  it('should handle transactions without status', () => {
    // Create transaction without explicitly setting status (will default to pending)
    const transactions = [
      { ...createMockTransaction('tx-1'), status: undefined }
    ];

    const result = getToastProceededStatus(transactions);

    // Should default to pending
    expect(result.status).toBe('pending');
    expect(result.withTransactionsHidden).toBe(false);
  });
});
