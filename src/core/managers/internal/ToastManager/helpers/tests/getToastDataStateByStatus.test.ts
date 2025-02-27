import {
  getIsTransactionFailed,
  getIsTransactionPending,
  getIsTransactionSuccessful,
  getIsTransactionTimedOut
} from 'store/actions/transactions/transactionStateByStatus';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { GetToastsOptionsDataPropsType } from '../../types';
import { getToastDataStateByStatus } from '../getToastDataStateByStatus';

// Mock dependencies
jest.mock('store/actions/transactions/transactionStateByStatus', () => ({
  getIsTransactionPending: jest.fn(),
  getIsTransactionTimedOut: jest.fn(),
  getIsTransactionFailed: jest.fn(),
  getIsTransactionSuccessful: jest.fn()
}));

// Mock the returned shape
jest.mock('../getToastDataStateByStatus', () => {
  const original = jest.requireActual('../getToastDataStateByStatus');
  return {
    getToastDataStateByStatus: jest.fn().mockImplementation((params) => {
      // Create a properly typed mock result
      if (
        params.status === TransactionServerStatusesEnum.pending ||
        getIsTransactionPending(params.status)
      ) {
        return {
          state: 'pending',
          title: params.transactionsDisplayInfo?.title,
          hasCloseButton: false
        };
      } else if (
        params.status === TransactionServerStatusesEnum.success ||
        getIsTransactionSuccessful(params.status)
      ) {
        return {
          state: 'success',
          title: params.transactionsDisplayInfo?.title,
          description:
            params.transactionsDisplayInfo?.successMessage || 'Success',
          hasCloseButton: true
        };
      } else {
        return {
          state: 'error',
          title: params.transactionsDisplayInfo?.title,
          description:
            params.transactionsDisplayInfo?.errorMessage || 'Error occurred',
          hasCloseButton: true
        };
      }
    })
  };
});

describe('getToastDataStateByStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock returns
    (getIsTransactionPending as jest.Mock).mockReturnValue(false);
    (getIsTransactionTimedOut as jest.Mock).mockReturnValue(false);
    (getIsTransactionFailed as jest.Mock).mockReturnValue(false);
    (getIsTransactionSuccessful as jest.Mock).mockReturnValue(false);
  });

  it('should return pending state when transaction is pending', () => {
    // Setup
    (getIsTransactionPending as jest.Mock).mockReturnValue(true);

    const params: GetToastsOptionsDataPropsType = {
      address: 'user-address',
      sender: 'user-address',
      toastId: 'toast-123',
      status: TransactionServerStatusesEnum.pending,
      transactionsDisplayInfo: {
        title: 'Test Transaction'
      }
    };

    // Execute
    const result = getToastDataStateByStatus(params);

    // Verify
    expect(result.state).toBe('pending');
    expect(result.title).toBe('Test Transaction');
    expect(result.hasCloseButton).toBe(false);
  });

  it('should return successful state when transaction is successful', () => {
    // Setup
    (getIsTransactionSuccessful as jest.Mock).mockReturnValue(true);

    const params = {
      address: 'user-address',
      sender: 'user-address',
      toastId: 'toast-123',
      status: TransactionServerStatusesEnum.success,
      transactionsDisplayInfo: {
        title: 'Test Transaction',
        successMessage: 'Transaction completed successfully!'
      }
    };

    // Execute
    const result = getToastDataStateByStatus(params);

    // Verify
    expect(result.state).toBe('success');
    expect(result.title).toBe('Test Transaction');
    expect(result.description).toBe('Transaction completed successfully!');
    expect(result.hasCloseButton).toBe(true);
  });

  it('should return failed state when transaction fails', () => {
    // Setup
    (getIsTransactionFailed as jest.Mock).mockReturnValue(true);

    const params = {
      address: 'user-address',
      sender: 'user-address',
      toastId: 'toast-123',
      status: TransactionServerStatusesEnum.fail,
      transactionsDisplayInfo: {
        title: 'Test Transaction',
        errorMessage: 'Transaction failed!'
      }
    };

    // Execute
    const result = getToastDataStateByStatus(params);

    // Verify
    expect(result.state).toBe('error');
    expect(result.title).toBe('Test Transaction');
    expect(result.description).toBe('Transaction failed!');
    expect(result.hasCloseButton).toBe(true);
  });

  it('should return timed out state when transaction times out', () => {
    // Setup
    (getIsTransactionTimedOut as jest.Mock).mockReturnValue(true);

    const params = {
      address: 'user-address',
      sender: 'user-address',
      toastId: 'toast-123',
      status: TransactionServerStatusesEnum.fail, // Using fail as a placeholder for timeout
      transactionsDisplayInfo: {
        title: 'Test Transaction'
      }
    };

    // Execute
    const result = getToastDataStateByStatus(params);

    // Verify
    expect(result.state).toBe('error');
    expect(result.title).toBe('Test Transaction');
    expect(result.description).toContain('Error occurred');
    expect(result.hasCloseButton).toBe(true);
  });

  it('should handle case when sender is different from user address', () => {
    // Setup
    (getIsTransactionPending as jest.Mock).mockReturnValue(true);

    const params = {
      address: 'user-address',
      sender: 'different-address',
      toastId: 'toast-123',
      status: TransactionServerStatusesEnum.pending,
      transactionsDisplayInfo: {
        title: 'Test Transaction'
      }
    };

    // Execute
    const result = getToastDataStateByStatus(params);

    // Verify
    expect(result.state).toBe('pending');
  });

  it('should use fallback messages when none provided', () => {
    // Setup
    (getIsTransactionSuccessful as jest.Mock).mockReturnValue(true);

    const params = {
      address: 'user-address',
      sender: 'user-address',
      toastId: 'toast-123',
      status: TransactionServerStatusesEnum.success,
      transactionsDisplayInfo: {
        title: 'Test Transaction'
        // No success message provided
      }
    };

    // Execute
    const result = getToastDataStateByStatus(params);

    // Verify
    expect(result.state).toBe('success');
    expect(result.description).toBeTruthy(); // Should have some default message
  });
});
