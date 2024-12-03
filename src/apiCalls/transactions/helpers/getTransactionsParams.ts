import { GetTransactionsParamsType } from '../types/getTransactions.types';

export function getTransactionsParams({
  sender,
  receiver,
  page = 1,
  transactionSize = 15,
  condition = 'should',
  withScResults = true,
  after,
  before,
  search,
  status,
  withUsername
}: GetTransactionsParamsType) {
  const params = {
    sender,
    receiver,
    condition,
    after,
    before,
    search,
    from: (page - 1) * transactionSize,
    ...(transactionSize > 0 ? { size: transactionSize } : {}),
    withScResults,
    withUsername,
    status
  };

  return params;
}
