import { getServerTransactionsByHashes } from 'apiCalls/transactions/getServerTransactionsByHashes';
import { ITransactionListItem } from 'lib/sdkDappCoreUi';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { ServerTransactionType } from 'types/serverTransactions.types';
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

    if (newTransactions.length < hashesToFetch.length) {
      const filteredHashes = hashesToFetch.filter(
        (hash) =>
          !newTransactions.some((transaction) => transaction.txHash === hash)
      );

      const pendingDummyTransactions = filteredHashes.map(
        (hash) =>
          ({
            txHash: hash,
            status: TransactionServerStatusesEnum.pending,
            data: '',
            gasLimit: 0,
            gasPrice: 0,
            gasUsed: 0,
            miniBlockHash: '',
            nonce: 0,
            receiver: '',
            receiverShard: 0,
            round: 0,
            sender: '',
            senderShard: 0,
            signature: '',
            timestamp: Date.now(),
            value: '0'
          }) as ServerTransactionType
      );

      newTransactions.push(...pendingDummyTransactions);
    }

    // Cache the newly fetched transactions
    newTransactions.forEach((transaction) => {
      const hash = transaction.originalTxHash ?? transaction.txHash;

      const transactionListItem = mapTransactionToListItem({
        transaction,
        address,
        explorerAddress,
        egldLabel
      });

      if (
        transactionListItem.status !== TransactionServerStatusesEnum.pending
      ) {
        cacheTransaction(hash, transactionListItem);
      }

      cachedTransactions.push(transactionListItem);
    });
  }

  return cachedTransactions.sort((a, b) => b.timestamp - a.timestamp);
};
