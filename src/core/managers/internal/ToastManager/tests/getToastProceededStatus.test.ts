import { isServerTransactionPending } from 'store/actions/transactions/transactionStateByStatus';
import { TransactionServerStatusesEnum } from 'types';
import { SignedTransactionType } from 'types/transactions.types';
import { getToastTransactionsStatus } from '../helpers/getToastTransactionsStatus';

jest.mock('store/actions/transactions/transactionStateByStatus');

describe('getToastProceededStatus', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return "Transaction processed" for a single processed transaction', () => {
    const transactions: SignedTransactionType[] = [
      { status: TransactionServerStatusesEnum.success } as SignedTransactionType
    ];
    (isServerTransactionPending as jest.Mock).mockReturnValue(false);

    const result = getToastTransactionsStatus(transactions);

    expect(result).toBe('Transaction processed');
  });

  it('should return "0 / 1 transactions processed" for a single pending transaction', () => {
    const transactions: SignedTransactionType[] = [
      { status: TransactionServerStatusesEnum.pending } as SignedTransactionType
    ];
    (isServerTransactionPending as jest.Mock).mockReturnValue(true);

    const result = getToastTransactionsStatus(transactions);

    expect(result).toBe('0 / 1 transactions processed');
  });

  it('should return "1 / 2 transactions processed" for multiple transactions with one processed', () => {
    const transactions: SignedTransactionType[] = [
      {
        status: TransactionServerStatusesEnum.success
      } as SignedTransactionType,
      { status: TransactionServerStatusesEnum.pending } as SignedTransactionType
    ];
    (isServerTransactionPending as jest.Mock).mockImplementation(
      (status) => status === TransactionServerStatusesEnum.pending
    );

    const result = getToastTransactionsStatus(transactions);

    expect(result).toBe('1 / 2 transactions processed');
  });

  it('should return "0 / 2 transactions processed" for multiple pending transactions', () => {
    const transactions: SignedTransactionType[] = [
      {
        status: TransactionServerStatusesEnum.pending
      } as SignedTransactionType,
      { status: TransactionServerStatusesEnum.pending } as SignedTransactionType
    ];
    (isServerTransactionPending as jest.Mock).mockReturnValue(true);

    const result = getToastTransactionsStatus(transactions);

    expect(result).toBe('0 / 2 transactions processed');
  });

  it('should return "2 / 2 transactions processed" for multiple processed transactions', () => {
    const transactions: SignedTransactionType[] = [
      {
        status: TransactionServerStatusesEnum.success
      } as SignedTransactionType,
      { status: TransactionServerStatusesEnum.success } as SignedTransactionType
    ];
    (isServerTransactionPending as jest.Mock).mockReturnValue(false);

    const result = getToastTransactionsStatus(transactions);

    expect(result).toBe('2 / 2 transactions processed');
  });
});
