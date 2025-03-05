import { testAddress } from '__mocks__/accountConfig';
import {
  getIsTransactionPending,
  getIsTransactionSuccessful
} from 'store/actions/transactions/transactionStateByStatus';
import { AccountSliceType } from 'store/slices/account/account.types';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import {
  SignedTransactionType,
  TransactionsDisplayInfoType
} from 'types/transactions.types';
import { ITransactionToast } from '../../types/toast.types';
import { createToastsFromTransactions } from '../createToastsFromTransactions';
import { createTransactionToast } from '../createTransactionToast';

jest.mock('store/actions/transactions/transactionStateByStatus', () => ({
  getIsTransactionPending: jest.fn(),
  getIsTransactionTimedOut: jest.fn(),
  getIsTransactionFailed: jest.fn(),
  getIsTransactionSuccessful: jest.fn()
}));

jest.mock('../createTransactionToast', () => ({
  createTransactionToast: jest.fn().mockImplementation(({ toast }) => ({
    toastId: toast.toastId
  }))
}));

describe('createToastsFromTransactions', () => {
  const TOAST_IDS = {
    PENDING: 'pending-toast',
    SUCCESS: 'success-toast',
    EXISTING: 'existing-toast',
    MISSING: 'missing-toast'
  } as const;

  const mockAccount: AccountSliceType = {
    address: testAddress,
    accounts: {},
    publicKey: '',
    ledgerAccount: null,
    walletConnectAccount: null,
    websocketEvent: null,
    websocketBatchEvent: null
  };

  const mockTransaction: SignedTransactionType = {
    nonce: 0,
    value: '0',
    receiver: testAddress,
    sender: testAddress,
    gasPrice: 1000000000,
    gasLimit: 50000,
    data: '',
    chainID: '1',
    version: 1,
    options: 0,
    signature: '',
    hash: 'tx-1'
  };

  const mockDisplayInfo: TransactionsDisplayInfoType = {
    processingMessage: 'Processing',
    successMessage: 'Success',
    errorMessage: 'Error',
    receivedMessage: 'Received',
    timedOutMessage: 'Timed Out',
    invalidMessage: 'Invalid'
  };

  const createMockToast = (toastId: string) => {
    const now = Date.now();
    return {
      toastId,
      startTime: now,
      endTime: now
    };
  };

  const createMockSession = (
    status: TransactionServerStatusesEnum,
    transactionHash: string,
    transactionStatus?: TransactionServerStatusesEnum
  ) => ({
    status,
    transactions: [
      {
        ...mockTransaction,
        hash: transactionHash,
        ...(transactionStatus && { status: transactionStatus })
      }
    ],
    transactionsDisplayInfo: mockDisplayInfo
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty arrays for processing and completed transactions when no transactions exist', () => {
    const result = createToastsFromTransactions({
      toastList: { transactionToasts: [], customToasts: [] },
      sessions: {},
      account: mockAccount
    });

    expect(result).toEqual({
      pendingTransactions: [],
      completedTransactions: []
    });
  });

  it('should correctly classify transactions as processing or completed based on their status', () => {
    (getIsTransactionPending as jest.Mock).mockImplementation(
      (status) => status === TransactionServerStatusesEnum.pending
    );

    (getIsTransactionSuccessful as jest.Mock).mockImplementation(
      (status) => status === TransactionServerStatusesEnum.success
    );

    const toastList = {
      transactionToasts: [
        createMockToast(TOAST_IDS.PENDING),
        createMockToast(TOAST_IDS.SUCCESS)
      ],
      customToasts: []
    };

    const sessions = {
      [TOAST_IDS.PENDING]: createMockSession(
        TransactionServerStatusesEnum.pending,
        'tx-1'
      ),
      [TOAST_IDS.SUCCESS]: createMockSession(
        TransactionServerStatusesEnum.success,
        'tx-2',
        TransactionServerStatusesEnum.success
      )
    };

    const result = createToastsFromTransactions({
      toastList,
      sessions,
      account: mockAccount
    });

    expect(result.pendingTransactions).toHaveLength(1);
    expect(result.pendingTransactions[0].toastId).toBe(TOAST_IDS.PENDING);
    expect(result.completedTransactions).toHaveLength(1);
    expect(result.completedTransactions[0].toastId).toBe(TOAST_IDS.SUCCESS);
  });

  it('should preserve existing completed transactions and not create duplicates when same transaction is processed again', () => {
    (getIsTransactionSuccessful as jest.Mock).mockReturnValue(true);

    const existingCompleted: ITransactionToast[] = [
      {
        toastId: TOAST_IDS.EXISTING,
        processedTransactionsStatus: TransactionServerStatusesEnum.success,
        transactions: [],
        toastDataState: {
          id: TOAST_IDS.EXISTING,
          icon: 'check',
          hasCloseButton: true,
          title: 'Transaction successful',
          iconClassName: TransactionServerStatusesEnum.success
        }
      }
    ];

    const toastList = {
      transactionToasts: [createMockToast(TOAST_IDS.EXISTING)],
      customToasts: []
    };

    const sessions = {
      [TOAST_IDS.EXISTING]: createMockSession(
        TransactionServerStatusesEnum.success,
        'tx-existing'
      )
    };

    const result = createToastsFromTransactions({
      toastList,
      sessions,
      account: mockAccount,
      existingCompletedTransactions: existingCompleted
    });

    expect(result.completedTransactions).toHaveLength(1);
    expect(createTransactionToast).not.toHaveBeenCalled();
  });

  it('should safely handle transactions with missing session data without creating toasts', () => {
    const toastList = {
      transactionToasts: [createMockToast(TOAST_IDS.MISSING)],
      customToasts: []
    };

    const result = createToastsFromTransactions({
      toastList,
      sessions: {},
      account: mockAccount
    });

    expect(result.pendingTransactions).toHaveLength(0);
    expect(result.completedTransactions).toHaveLength(0);
    expect(createTransactionToast).not.toHaveBeenCalled();
  });
});
