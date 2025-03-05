import { testAddress } from '__mocks__/accountConfig';
import { getIsTransactionPending } from 'store/actions/transactions/transactionStateByStatus';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { SignedTransactionType } from 'types/transactions.types';
import { createTransactionToast } from '../createTransactionToast';
import { getToastDataStateByStatus } from '../getToastDataStateByStatus';
import { getToastTransactionsStatus } from '../getToastTransactionsStatus';

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
  const TOAST_IDS = {
    PENDING: 'pending-toast',
    SUCCESS: 'success-toast'
  } as const;

  const EXPLORER_ADDRESS = 'https://explorer.example.com';

  const baseTransaction: SignedTransactionType = {
    hash: 'tx-hash',
    sender: testAddress,
    receiver: testAddress,
    value: '1000000000000000000',
    data: 'data',
    nonce: 1,
    gasPrice: 1000000000,
    gasLimit: 50000,
    chainID: '1',
    version: 1,
    options: 0
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a pending transaction toast with progress state and explorer link', () => {
    const now = Date.now();
    (getIsTransactionPending as jest.Mock).mockReturnValue(true);
    (getToastDataStateByStatus as jest.Mock).mockReturnValue({
      state: 'pending'
    });
    (getToastTransactionsStatus as jest.Mock).mockReturnValue('Processing');

    const result = createTransactionToast({
      toastId: TOAST_IDS.PENDING,
      address: testAddress,
      status: TransactionServerStatusesEnum.pending,
      transactions: [
        { ...baseTransaction, status: TransactionServerStatusesEnum.pending }
      ],
      transactionsDisplayInfo: { processingMessage: 'Pending Transaction' },
      explorerAddress: EXPLORER_ADDRESS,
      startTime: now,
      endTime: now + 1000
    });

    expect(result).toEqual({
      toastId: TOAST_IDS.PENDING,
      toastDataState: { state: 'pending' },
      processedTransactionsStatus: 'Processing',
      transactionProgressState: {
        startTime: now,
        endTime: now + 1000
      },
      transactions: [
        {
          hash: 'tx-hash',
          status: TransactionServerStatusesEnum.pending,
          link: `${EXPLORER_ADDRESS}/tx/tx-hash`
        }
      ]
    });
  });

  it('should create a completed transaction toast without progress state', () => {
    (getIsTransactionPending as jest.Mock).mockReturnValue(false);
    (getToastDataStateByStatus as jest.Mock).mockReturnValue({
      state: 'success'
    });
    (getToastTransactionsStatus as jest.Mock).mockReturnValue('Completed');

    const result = createTransactionToast({
      toastId: TOAST_IDS.SUCCESS,
      address: testAddress,
      status: TransactionServerStatusesEnum.success,
      transactions: [
        { ...baseTransaction, status: TransactionServerStatusesEnum.success }
      ],
      transactionsDisplayInfo: { successMessage: 'Successful Transaction' },
      explorerAddress: EXPLORER_ADDRESS,
      startTime: 1000,
      endTime: 2000
    });

    expect(result).toEqual({
      toastId: TOAST_IDS.SUCCESS,
      toastDataState: { state: 'success' },
      processedTransactionsStatus: 'Completed',
      transactionProgressState: null,
      transactions: [
        {
          hash: 'tx-hash',
          status: TransactionServerStatusesEnum.success,
          link: `${EXPLORER_ADDRESS}/tx/tx-hash`
        }
      ]
    });
  });

  it('should handle multiple transactions by creating explorer links for each', () => {
    (getIsTransactionPending as jest.Mock).mockReturnValue(false);
    (getToastDataStateByStatus as jest.Mock).mockReturnValue({
      state: 'success'
    });
    (getToastTransactionsStatus as jest.Mock).mockReturnValue('All Completed');

    const transactions = [
      {
        ...baseTransaction,
        hash: 'tx-1',
        status: TransactionServerStatusesEnum.success
      },
      {
        ...baseTransaction,
        hash: 'tx-2',
        status: TransactionServerStatusesEnum.success
      }
    ];

    const result = createTransactionToast({
      toastId: TOAST_IDS.SUCCESS,
      address: testAddress,
      status: TransactionServerStatusesEnum.success,
      transactions,
      transactionsDisplayInfo: {
        processingMessage: 'Multiple Transactions',
        successMessage: 'Multiple Transactions Description'
      },
      explorerAddress: EXPLORER_ADDRESS,
      startTime: 1000,
      endTime: 2000
    });

    expect(result.transactions).toHaveLength(2);
    expect(result.transactions[0].link).toBe(`${EXPLORER_ADDRESS}/tx/tx-1`);
    expect(result.transactions[1].link).toBe(`${EXPLORER_ADDRESS}/tx/tx-2`);
  });
});
