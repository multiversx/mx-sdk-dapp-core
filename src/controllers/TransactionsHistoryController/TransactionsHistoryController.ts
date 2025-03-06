import { GetHistoricalTransactionsParamsType } from 'types/transaction-list-item.types';
import { getTransactionsHistory } from 'utils/transactions';

// Note: Will replace TransactionsTableController in the future
export const TransactionsHistoryController = {
  async getTransactionsHistory(params: GetHistoricalTransactionsParamsType) {
    const transactions = await getTransactionsHistory(params);
    return transactions;
  }
};
