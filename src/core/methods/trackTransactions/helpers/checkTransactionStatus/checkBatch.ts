import { getTransactionsByHashes } from 'apiCalls/transactions/getTransactionsByHashes';
import {
  updateTrackedTransactionStatus,
  updateTrackedTransactionsSession
} from 'store/actions/trackedTransactions/trackedTransactionsActions';
import { getIsTransactionFailed } from 'store/actions/transactions/transactionStateByStatus';
import {
  TransactionBatchStatusesEnum,
  TransactionServerStatusesEnum
} from 'types/enums.types';
import { ServerTransactionType } from 'types/serverTransactions.types';
import {
  GetTransactionsByHashesReturnType,
  SignedTransactionType
} from 'types/transactions.types';
import { refreshAccount } from 'utils/account';

import { getPendingTransactions } from './getPendingTransactions';
import { manageFailedTransactions } from './manageFailedTransactions';
import { TransactionsTrackerType } from '../../trackTransactions.types';

export interface TransactionStatusTrackerPropsType
  extends TransactionsTrackerType {
  sessionId: string;
  transactionBatch: SignedTransactionType[];
  shouldRefreshBalance?: boolean;
  isSequential?: boolean;
}

interface RetriesType {
  [hash: string]: number;
}

const retries: RetriesType = {};
const timeouts: string[] = [];

interface ManageTransactionType {
  serverTransaction: GetTransactionsByHashesReturnType[0];
  sessionId: string;
  shouldRefreshBalance?: boolean;
  isSequential?: boolean;
}

function manageTransaction({
  serverTransaction,
  sessionId,
  shouldRefreshBalance,
  isSequential
}: ManageTransactionType) {
  const {
    hash,
    status,
    inTransit,
    results,
    invalidTransaction,
    hasStatusChanged
  } = serverTransaction;
  try {
    if (timeouts.includes(hash)) {
      return;
    }

    const retriesForThisHash = retries[hash];
    if (retriesForThisHash > 30) {
      // consider transaction as stuck after 1 minute
      updateTrackedTransactionsSession({
        sessionId,
        status: TransactionBatchStatusesEnum.timedOut
      });
      return;
    }

    if (
      (invalidTransaction && !isSequential) ||
      status === TransactionBatchStatusesEnum.sent
    ) {
      retries[hash] = retries[hash] ? retries[hash] + 1 : 1;
      return;
    }

    // The tx is from a sequential batch.
    // If the transactions before this are not successful then it means that no other tx will be processed
    if (isSequential && !status) {
      updateTrackedTransactionStatus({
        sessionId,
        status,
        transactionHash: hash,
        inTransit,
        serverTransaction: serverTransaction as unknown as ServerTransactionType
      });
      return;
    }

    if (hasStatusChanged) {
      updateTrackedTransactionStatus({
        sessionId,
        status,
        transactionHash: hash,
        inTransit,
        serverTransaction: serverTransaction as unknown as ServerTransactionType
      });
    }

    // if set to true will trigger a balance refresh after each iteration
    if (!shouldRefreshBalance) {
      refreshAccount();
    }

    if (getIsTransactionFailed(status)) {
      manageFailedTransactions({ sessionId, hash, results });
    }
  } catch (error) {
    console.error(error);
    updateTrackedTransactionsSession({
      sessionId,
      status: TransactionBatchStatusesEnum.timedOut
    });
  }
}

export async function checkBatch({
  sessionId,
  transactionBatch: transactions,
  getTransactionsByHash = getTransactionsByHashes,
  shouldRefreshBalance,
  isSequential,
  onSuccess,
  onFail
}: TransactionStatusTrackerPropsType) {
  try {
    if (transactions == null) {
      return;
    }

    const pendingTransactions = getPendingTransactions(transactions, timeouts);

    const serverTransactions = await getTransactionsByHash(pendingTransactions);

    for (const serverTransaction of serverTransactions) {
      manageTransaction({
        serverTransaction,
        sessionId,
        shouldRefreshBalance,
        isSequential
      });
    }

    const hasCompleted = serverTransactions.every(
      (tx) => tx.status !== TransactionServerStatusesEnum.pending
    );

    // Call the onSuccess or onFail callback only if the transactions are sent normally (not using batch transactions mechanism).
    // The batch transactions mechanism will call the callbacks separately.

    // TODO: check grouping and sequential transactions
    if (hasCompleted /* && !customTransactionInformation?.grouping */) {
      const isSuccessful = serverTransactions.every(
        (tx) => tx.status === TransactionServerStatusesEnum.success
      );

      if (isSuccessful) {
        updateTrackedTransactionsSession({
          sessionId,
          status: TransactionBatchStatusesEnum.success
        });
        return onSuccess?.(sessionId);
      }

      const isFailed = serverTransactions.some(
        (tx) => tx.status === TransactionServerStatusesEnum.fail
      );

      if (isFailed) {
        updateTrackedTransactionsSession({
          sessionId,
          status: TransactionBatchStatusesEnum.fail
        });
        return onFail?.(sessionId);
      }
    }
  } catch (error) {
    console.error(error);
  }
}
