import { getServerTransactionsByHashes } from 'apiCalls/transactions/getServerTransactionsByHashes';
import { ITransactionListItem } from 'lib/sdkDappCoreUi';
import { cacheTransaction, getCachedTransaction } from './cacheTransactions';
import { mapTransactionToListItem } from './mapTransactionToListItem';

interface IMapServerTransactionsToListItemsParams {
  hashes: string[];
  address: string;
  explorerAddress: string;
  egldLabel: string;
}

export const mapServerTransactionsToListItems = async ({
  hashes,
  address,
  explorerAddress,
  egldLabel
}: IMapServerTransactionsToListItemsParams): Promise<
  ITransactionListItem[]
> => {
  const cachedTransactions: ITransactionListItem[] = [];
  const hashesToFetch: string[] = [];

  hashes.forEach((hash) => {
    const cachedTransaction = getCachedTransaction(hash);
    if (cachedTransaction) {
      cachedTransactions.push(cachedTransaction);
    } else {
      hashesToFetch.push(hash);
    }
  });

  if (hashesToFetch.length > 0) {
    const newTransactions = await getServerTransactionsByHashes(hashesToFetch);

    // Cache the newly fetched transactions
    newTransactions.forEach((transaction) => {
      const hash = transaction.originalTxHash ?? transaction.txHash;

      const transactionListItem = mapTransactionToListItem({
        transaction,
        address,
        explorerAddress,
        egldLabel
      });

      cacheTransaction(hash, transactionListItem);
      cachedTransactions.push(transactionListItem);
    });
  }

  return cachedTransactions.sort((a, b) => b.timestamp - a.timestamp);
};
