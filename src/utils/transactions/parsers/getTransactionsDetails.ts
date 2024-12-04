import { TransactionStatus } from '@multiversx/sdk-core/out';
import { getTransactionByHash } from 'apiCalls';
import { ServerTransactionType } from 'types/serverTransactions.types';
import { sleep } from '../../asyncActions';

export async function getTransactionsDetails(txHashes: string[]) {
  const delayMs = 3000;
  let retries = 4;
  let transactions: ServerTransactionType[] | undefined;

  if (txHashes.length === 0) {
    return { data: transactions, success: false };
  }

  while (transactions === undefined && retries > 0) {
    try {
      await sleep(delayMs);

      const promiseResponse = await Promise.allSettled(
        txHashes.map((hash) => getTransactionByHash(hash))
      );

      const apiTransactions = promiseResponse
        .map((response) =>
          response.status === 'fulfilled' ? response.value.data : undefined
        )
        .filter((tx) => tx !== undefined) as ServerTransactionType[];

      const success = apiTransactions.length > 0;

      if (success) {
        const foundAll = apiTransactions.length === txHashes.length;

        const hasPendingTx = apiTransactions.some((tx) => {
          const status = new TransactionStatus(tx.status);
          return status.isPending();
        });

        if ((foundAll && !hasPendingTx) || retries === 1) {
          transactions = apiTransactions;
          retries = 0;
        } else {
          retries -= 1;
        }
      } else {
        retries -= 1;
      }
    } catch {
      retries -= 1;
    }
  }

  return { data: transactions, success: transactions !== undefined };
}
