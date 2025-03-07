import { isServerTransactionPending } from 'store/actions/transactions/transactionStateByStatus';
import { TransactionServerStatusesEnum } from 'types';
import { ISignedTransaction } from 'types/transactions.types';
import { getToastTransactionsStatus } from '../helpers/getToastTransactionsStatus';

jest.mock('store/actions/transactions/transactionStateByStatus');

describe('getToastProceededStatus', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return "Transaction processed" for a single processed transaction', () => {
    const transactions: ISignedTransaction[] = [
      { status: TransactionServerStatusesEnum.success } as ISignedTransaction
    ];
    (isServerTransactionPending as jest.Mock).mockReturnValue(false);

    const result = getToastTransactionsStatus(transactions);

    expect(result).toBe('Transaction processed');
  });

  it('should return "0 / 1 transactions processed" for a single pending transaction', () => {
    const transactions: ISignedTransaction[] = [
      { status: TransactionServerStatusesEnum.pending } as ISignedTransaction
    ];
    (isServerTransactionPending as jest.Mock).mockReturnValue(true);

    const result = getToastTransactionsStatus(transactions);

    expect(result).toBe('0 / 1 transactions processed');
  });

  it('should return "1 / 2 transactions processed" for multiple transactions with one processed', () => {
    const transactions: ISignedTransaction[] = [
      {
        status: TransactionServerStatusesEnum.success
      } as ISignedTransaction,
      { status: TransactionServerStatusesEnum.pending } as ISignedTransaction
    ];
    (isServerTransactionPending as jest.Mock).mockImplementation(
      (status) => status === TransactionServerStatusesEnum.pending
    );

    const result = getToastTransactionsStatus(transactions);

    expect(result).toBe('1 / 2 transactions processed');
  });

  it('should return "0 / 2 transactions processed" for multiple pending transactions', () => {
    const transactions: ISignedTransaction[] = [
      {
        status: TransactionServerStatusesEnum.pending
      } as ISignedTransaction,
      { status: TransactionServerStatusesEnum.pending } as ISignedTransaction
    ];
    (isServerTransactionPending as jest.Mock).mockReturnValue(true);

    const result = getToastTransactionsStatus(transactions);

    expect(result).toBe('0 / 2 transactions processed');
  });

  it('should return "2 / 2 transactions processed" for multiple processed transactions', () => {
    const transactions: ISignedTransaction[] = [
      {
        status: TransactionServerStatusesEnum.success
      } as ISignedTransaction,
      { status: TransactionServerStatusesEnum.success } as ISignedTransaction
    ];
    (isServerTransactionPending as jest.Mock).mockReturnValue(false);

    const result = getToastTransactionsStatus(transactions);

    expect(result).toBe('2 / 2 transactions processed');
  });
});
