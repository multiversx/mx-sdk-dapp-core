import { getIsTransactionPending } from 'store/actions/transactions/transactionStateByStatus';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { explorerUrlBuilder } from 'utils/transactions/explorerUrlBuilder';
import { getExplorerLink } from 'utils/transactions/getExplorerLink';
import { createTransactionToast } from '../createTransactionToast';
import { getToastDataStateByStatus } from '../getToastDataStateByStatus';
import { getToastProceededStatus } from '../getToastProceededStatus';
import { createMockTransaction } from './mocks/mockTypes';

// Mock dependencies
jest.mock('store/actions/transactions/transactionStateByStatus', () => ({
  getIsTransactionPending: jest.fn()
}));

jest.mock('../getToastDataStateByStatus', () => ({
  getToastDataStateByStatus: jest.fn()
}));

jest.mock('../getToastProceededStatus', () => ({
  getToastProceededStatus: jest.fn()
}));

jest.mock('utils/transactions/explorerUrlBuilder', () => ({
  explorerUrlBuilder: {
    transactionDetails: jest.fn((hash) => `tx/${hash}`)
  }
}));

jest.mock('utils/transactions/getExplorerLink', () => ({
  getExplorerLink: jest.fn(
    ({ explorerAddress, to }) => `${explorerAddress}/${to}`
  )
}));

describe('createTransactionToast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a transaction toast with pending status', () => {
    // Mock return values
    (getIsTransactionPending as jest.Mock).mockReturnValue(true);
    (getToastDataStateByStatus as jest.Mock).mockReturnValue({
      state: 'pending'
    });
    (getToastProceededStatus as jest.Mock).mockReturnValue({
      status: 'pending'
    });

    // Create mock transaction
    const mockTransaction = createMockTransaction('tx-hash-1');

    const props = {
      toast: { toastId: 'toast-123' },
      account: { address: 'user-address' },
      status: TransactionServerStatusesEnum.pending,
      transactions: [mockTransaction],
      transactionsDisplayInfo: { title: 'Transaction Title' },
      explorerAddress: 'https://explorer.example.com',
      startTime: 1000,
      endTime: 2000
    };

    const result = createTransactionToast(props);

    // Check that the result has the expected structure
    expect(result).toEqual({
      toastDataState: { state: 'pending' },
      processedTransactionsStatus: { status: 'pending' },
      transactionProgressState: {
        startTime: 1000,
        endTime: 2000
      },
      toastId: 'toast-123',
      transactions: [
        {
          hash: 'tx-hash-1',
          status: TransactionServerStatusesEnum.pending,
          link: 'https://explorer.example.com/tx/tx-hash-1'
        }
      ]
    });

    // Check that the expected functions were called with correct parameters
    expect(getIsTransactionPending).toHaveBeenCalledWith('pending');
    expect(getToastDataStateByStatus).toHaveBeenCalledWith({
      address: 'user-address',
      sender: 'mock-sender',
      toastId: 'toast-123',
      status: 'pending',
      transactionsDisplayInfo: { title: 'Transaction Title' }
    });
    expect(getToastProceededStatus).toHaveBeenCalledWith([mockTransaction]);
    expect(explorerUrlBuilder.transactionDetails).toHaveBeenCalledWith(
      'tx-hash-1'
    );
    expect(getExplorerLink).toHaveBeenCalledWith({
      explorerAddress: 'https://explorer.example.com',
      to: 'tx/tx-hash-1'
    });
  });

  it('should create a transaction toast with completed status', () => {
    // Mock return values
    (getIsTransactionPending as jest.Mock).mockReturnValue(false);
    (getToastDataStateByStatus as jest.Mock).mockReturnValue({
      state: 'completed'
    });
    (getToastProceededStatus as jest.Mock).mockReturnValue({
      status: 'success'
    });

    // Create mock transaction
    const mockTransaction = createMockTransaction(
      'tx-hash-1',
      TransactionServerStatusesEnum.success
    );

    const props = {
      toast: { toastId: 'toast-123' },
      account: { address: 'user-address' },
      status: 'success',
      transactions: [mockTransaction],
      transactionsDisplayInfo: { title: 'Transaction Title' },
      explorerAddress: 'https://explorer.example.com',
      startTime: 1000,
      endTime: 2000
    };

    const result = createTransactionToast(props);

    // Check that the result has the expected structure
    expect(result).toEqual({
      toastDataState: { state: 'completed' },
      processedTransactionsStatus: { status: 'success' },
      transactionProgressState: null,
      toastId: 'toast-123',
      transactions: [
        {
          hash: 'tx-hash-1',
          status: TransactionServerStatusesEnum.success,
          link: 'https://explorer.example.com/tx/tx-hash-1'
        }
      ]
    });

    // Check that the expected functions were called
    expect(getIsTransactionPending).toHaveBeenCalledWith('success');
  });

  it('should handle multiple transactions', () => {
    // Mock return values
    (getIsTransactionPending as jest.Mock).mockReturnValue(false);
    (getToastDataStateByStatus as jest.Mock).mockReturnValue({
      state: 'completed'
    });
    (getToastProceededStatus as jest.Mock).mockReturnValue({
      status: 'success'
    });

    // Create mock transactions
    const mockTransaction1 = createMockTransaction(
      'tx-hash-1',
      TransactionServerStatusesEnum.success
    );

    const mockTransaction2 = createMockTransaction(
      'tx-hash-2',
      TransactionServerStatusesEnum.success
    );

    const props = {
      toast: { toastId: 'toast-123' },
      account: { address: 'user-address' },
      status: 'success',
      transactions: [mockTransaction1, mockTransaction2],
      transactionsDisplayInfo: { title: 'Transaction Title' },
      explorerAddress: 'https://explorer.example.com',
      startTime: 1000,
      endTime: 2000
    };

    const result = createTransactionToast(props);

    // Check that the result has the expected structure with multiple transactions
    expect(result.transactions.length).toBe(2);
    expect(result.transactions[0].hash).toBe('tx-hash-1');
    expect(result.transactions[1].hash).toBe('tx-hash-2');

    // Verify explorer links for both transactions
    expect(explorerUrlBuilder.transactionDetails).toHaveBeenCalledWith(
      'tx-hash-1'
    );
    expect(explorerUrlBuilder.transactionDetails).toHaveBeenCalledWith(
      'tx-hash-2'
    );
    expect(getExplorerLink).toHaveBeenCalledTimes(2);
  });
});
