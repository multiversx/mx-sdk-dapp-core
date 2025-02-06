import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum
} from 'types';
import { BatchTransactionStatus } from 'types/serverTransactions.types';

export const getBatchStatus = (
  status: BatchTransactionStatus
): TransactionBatchStatusesEnum | TransactionServerStatusesEnum => {
  switch (status) {
    case BatchTransactionStatus.invalid:
      return TransactionBatchStatusesEnum.invalid;
    case BatchTransactionStatus.fail:
    case BatchTransactionStatus.dropped:
      return TransactionBatchStatusesEnum.fail;
    case BatchTransactionStatus.success:
      return TransactionBatchStatusesEnum.success;
    case BatchTransactionStatus.pending:
    default:
      return TransactionServerStatusesEnum.pending;
  }
};
