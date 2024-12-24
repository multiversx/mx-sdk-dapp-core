import {
  updateTrackedTransactionStatus,
  updateTrackedTransactionsSession
} from 'store/actions/trackedTransactions/trackedTransactionsActions';
import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum
} from 'types/enums.types';
import {
  ResultType,
  ServerTransactionType
} from 'types/serverTransactions.types';

export function manageFailedTransactions({
  results,
  hash,
  sessionId
}: {
  results: ResultType[];
  hash: string;
  sessionId: string;
}) {
  const resultWithError = results?.find(
    (scResult) => scResult?.returnMessage !== ''
  );

  updateTrackedTransactionStatus({
    transactionHash: hash,
    sessionId,
    status: TransactionServerStatusesEnum.fail,
    errorMessage: resultWithError?.returnMessage,
    inTransit: false,
    serverTransaction: resultWithError as unknown as ServerTransactionType
  });

  updateTrackedTransactionsSession({
    sessionId,
    status: TransactionBatchStatusesEnum.fail,
    errorMessage: resultWithError?.returnMessage
  });
}
