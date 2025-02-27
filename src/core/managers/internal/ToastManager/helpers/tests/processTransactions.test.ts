import { getExplorerAddress } from 'core/methods/network/getExplorerAddress';
import {
  getIsTransactionFailed,
  getIsTransactionPending,
  getIsTransactionSuccessful,
  getIsTransactionTimedOut
} from 'store/actions/transactions/transactionStateByStatus';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { createTransactionToast } from '../createTransactionToast';
import { processTransactions } from '../processTransactions';
import {
  createMockSessions,
  createMockToastSlice,
  createMockTransaction
} from './mocks/mockTypes';
import { ITransactionToast } from '../../types/toast.types';
// Mock dependencies
jest.mock('core/methods/network/getExplorerAddress', () => ({
  getExplorerAddress: jest.fn()
}));

jest.mock('store/actions/transactions/transactionStateByStatus', () => ({
  getIsTransactionPending: jest.fn(),
  getIsTransactionTimedOut: jest.fn(),
  getIsTransactionFailed: jest.fn(),
  getIsTransactionSuccessful: jest.fn()
}));

jest.mock('../createTransactionToast', () => ({
  createTransactionToast: jest.fn()
}));

describe('processTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock values
    (getExplorerAddress as jest.Mock).mockReturnValue('https://explorer.test');
    (getIsTransactionPending as jest.Mock).mockReturnValue(false);
    (getIsTransactionTimedOut as jest.Mock).mockReturnValue(false);
    (getIsTransactionFailed as jest.Mock).mockReturnValue(false);
    (getIsTransactionSuccessful as jest.Mock).mockReturnValue(false);
    (createTransactionToast as jest.Mock).mockImplementation(({ toast }) => ({
      toastId: toast.toastId,
      mockToast: true
    }));
  });

  it('should return empty arrays when no transactions exist', () => {
    // Setup
    const toastList = createMockToastSlice([]);
    const sessions = {};
    const account = { address: 'user-address' };

    // Execute
    const result = processTransactions(toastList, sessions, account);

    // Verify
    expect(result).toEqual({
      processingTransactions: [],
      completedTransactions: []
    });
    expect(getExplorerAddress).toHaveBeenCalled();
  });

  it('should classify pending transactions correctly', () => {
    // Setup - mock a pending transaction
    (getIsTransactionPending as jest.Mock).mockReturnValue(true);

    const toastList = createMockToastSlice(['toast-1']);
    const sessions = createMockSessions(['toast-1'], 'pending');
    const account = { address: 'user-address' };

    // Mock the toast creation
    const mockTransactionToast = { toastId: 'toast-1', mockToast: true };
    (createTransactionToast as jest.Mock).mockReturnValue(mockTransactionToast);

    // Execute
    const result = processTransactions(toastList, sessions, account);

    // Verify
    expect(result.processingTransactions).toContain(mockTransactionToast);
    expect(result.completedTransactions).toHaveLength(0);
    expect(createTransactionToast).toHaveBeenCalledWith(
      expect.objectContaining({
        toast: expect.objectContaining({ toastId: 'toast-1' }),
        account,
        status: 'pending',
        transactions: expect.any(Array),
        transactionsDisplayInfo: expect.any(Object),
        explorerAddress: 'https://explorer.test'
      })
    );
  });

  it('should classify successful transactions as completed', () => {
    // Setup - mock a successful transaction
    (getIsTransactionSuccessful as jest.Mock).mockReturnValue(true);

    const toastList = createMockToastSlice(['toast-1']);
    const transactions = [
      createMockTransaction('tx-1', TransactionServerStatusesEnum.success)
    ];
    const sessions = createMockSessions(['toast-1'], 'success', transactions);
    const account = { address: 'user-address' };

    // Mock the toast creation
    const mockTransactionToast = { toastId: 'toast-1', mockToast: true };
    (createTransactionToast as jest.Mock).mockReturnValue(mockTransactionToast);

    // Execute
    const result = processTransactions(toastList, sessions, account);

    // Verify
    expect(result.processingTransactions).toHaveLength(0);
    expect(result.completedTransactions).toContain(mockTransactionToast);
  });

  it('should classify failed transactions as completed', () => {
    // Setup - mock a failed transaction
    (getIsTransactionFailed as jest.Mock).mockReturnValue(true);

    const toastList = createMockToastSlice(['toast-1']);
    const transactions = [
      createMockTransaction('tx-1', TransactionServerStatusesEnum.fail)
    ];
    const sessions = createMockSessions(['toast-1'], 'failed', transactions);
    const account = { address: 'user-address' };

    // Execute
    const result = processTransactions(toastList, sessions, account);

    // Verify
    expect(result.processingTransactions).toHaveLength(0);
    expect(result.completedTransactions).toHaveLength(1);
  });

  it('should classify timed out transactions as completed', () => {
    // Setup - mock a timed out transaction
    (getIsTransactionTimedOut as jest.Mock).mockReturnValue(true);

    const toastList = createMockToastSlice(['toast-1']);
    const transactions = [createMockTransaction('tx-1')];
    const sessions = createMockSessions(['toast-1'], 'timeout', transactions);
    const account = { address: 'user-address' };

    // Execute
    const result = processTransactions(toastList, sessions, account);

    // Verify
    expect(result.processingTransactions).toHaveLength(0);
    expect(result.completedTransactions).toHaveLength(1);
  });

  it('should not add duplicate transactions to completedTransactions', () => {
    // Setup - mock a successful transaction
    (getIsTransactionSuccessful as jest.Mock).mockReturnValue(true);

    const toastList = createMockToastSlice(['toast-1']);
    const sessions = createMockSessions(['toast-1'], 'success');
    const account = { address: 'user-address' };

    // Create an existing completed transaction with the same ID
    const existingCompletedTransactions: ITransactionToast[] = [
      {
        toastId: 'toast-1',
        processedTransactionsStatus: 'success',
        transactions: [],
        toastDataState: {
          id: 'toast-1',
          icon: 'check',
          hasCloseButton: true,
          title: 'Transaction successful',
          iconClassName: 'success'
        }
      }
    ];

    // Execute
    const result = processTransactions(
      toastList,
      sessions,
      account,
      existingCompletedTransactions
    );

    // Verify - should not add a duplicate
    expect(result.completedTransactions).toHaveLength(1);
    expect(createTransactionToast).not.toHaveBeenCalled();
  });

  it('should handle multiple transaction toasts of different types', () => {
    // Setup - different transaction types
    (getIsTransactionPending as jest.Mock).mockImplementation(
      (status) => status === 'pending'
    );
    (getIsTransactionSuccessful as jest.Mock).mockImplementation(
      (status) => status === 'success'
    );

    const toastList = createMockToastSlice(['toast-1', 'toast-2']);
    const sessions = {
      'toast-1': {
        status: 'pending',
        transactions: [createMockTransaction('tx-1')],
        transactionsDisplayInfo: { title: 'Pending Transaction' }
      },
      'toast-2': {
        status: 'success',
        transactions: [
          createMockTransaction('tx-2', TransactionServerStatusesEnum.success)
        ],
        transactionsDisplayInfo: { title: 'Successful Transaction' }
      }
    };

    const account = { address: 'user-address' };

    // Mock different toast creations
    (createTransactionToast as jest.Mock).mockImplementation(({ toast }) => ({
      toastId: toast.toastId,
      mockToast: true
    }));

    // Execute
    const result = processTransactions(toastList, sessions, account);

    // Verify
    expect(result.processingTransactions).toHaveLength(1);
    expect(result.processingTransactions[0].toastId).toBe('toast-1');

    expect(result.completedTransactions).toHaveLength(1);
    expect(result.completedTransactions[0].toastId).toBe('toast-2');

    expect(createTransactionToast).toHaveBeenCalledTimes(2);
  });

  it('should handle no transaction session data gracefully', () => {
    // Setup
    const toastList = createMockToastSlice(['toast-1']);
    // No matching session data for the toast
    const sessions = {};
    const account = { address: 'user-address' };

    // Execute
    const result = processTransactions(toastList, sessions, account);

    // Verify
    expect(result.processingTransactions).toHaveLength(0);
    expect(result.completedTransactions).toHaveLength(0);
    expect(createTransactionToast).not.toHaveBeenCalled();
  });
});
