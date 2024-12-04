import { TransactionServerStatusesEnum } from 'types';
import { getTransactionsStatus } from '../getTransactionsStatus';

describe('getTransactionsStatus', () => {
  it('should identify all transactions as successful', () => {
    const transactions = [
      { status: TransactionServerStatusesEnum.success },
      { status: TransactionServerStatusesEnum.success }
    ];

    const result = getTransactionsStatus({ transactions });

    expect(result).toEqual({
      isPending: false,
      isSuccessful: true,
      isFailed: false,
      isIncompleteFailed: false
    });
  });

  it('should identify pending transactions', () => {
    const transactions = [
      { status: TransactionServerStatusesEnum.success },
      { status: TransactionServerStatusesEnum.pending }
    ];

    const result = getTransactionsStatus({ transactions });

    expect(result).toEqual({
      isPending: true,
      isSuccessful: false,
      isFailed: false,
      isIncompleteFailed: false
    });
  });

  it('should identify failed transactions without unrelated transactions', () => {
    const transactions = [
      { status: TransactionServerStatusesEnum.fail },
      { status: TransactionServerStatusesEnum.success }
    ];

    const result = getTransactionsStatus({ transactions });

    expect(result).toEqual({
      isPending: false,
      isSuccessful: false,
      isFailed: true,
      isIncompleteFailed: false
    });
  });

  it('should handle all failed transactions with unrelated transactions', () => {
    const transactions = [
      { status: TransactionServerStatusesEnum.fail },
      { status: TransactionServerStatusesEnum.fail }
    ];

    const result = getTransactionsStatus({
      transactions,
      hasUnrelatedTransactions: true
    });

    expect(result).toEqual({
      isPending: false,
      isSuccessful: false,
      isFailed: true,
      isIncompleteFailed: false
    });
  });

  it('should identify incomplete failed status with unrelated transactions', () => {
    const transactions = [
      { status: TransactionServerStatusesEnum.fail },
      { status: TransactionServerStatusesEnum.success }
    ];

    const result = getTransactionsStatus({
      transactions,
      hasUnrelatedTransactions: true
    });

    expect(result).toEqual({
      isPending: false,
      isSuccessful: false,
      isFailed: false,
      isIncompleteFailed: true
    });
  });

  it('should handle empty transactions array', () => {
    const transactions: { status: TransactionServerStatusesEnum }[] = [];

    const result = getTransactionsStatus({ transactions });

    expect(result).toEqual({
      isPending: false,
      isSuccessful: true,
      isFailed: false,
      isIncompleteFailed: false
    });
  });
});
