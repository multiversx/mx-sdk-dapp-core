import { getServerTransactionsByHashes } from 'apiCalls/transactions/getServerTransactionsByHashes';
import { ITransactionListItem } from 'lib/sdkDappCoreUi';
import { setInterpretedTransactions } from 'store/actions/transactions/transactionsActions';
import { TransactionServerStatusesEnum } from 'types/enums.types';
import { ServerTransactionType } from 'types/serverTransactions.types';
import { getCachedTransactionListItem } from './getCachedTransactionListItem';
import { mapTransactionToListItem } from './mapTransactionToListItem';
interface IMapServerTransactionsToListItemsParams {
  hashes: string[];
  address: string;
  explorerAddress: string;
  egldLabel: string;
}

const sortTransactionsByTimestamp = (transactions: ITransactionListItem[]) =>
  transactions.sort((a, b) => b.timestamp - a.timestamp);

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
    const cachedTransaction = getCachedTransactionListItem(hash);
    if (cachedTransaction) {
      cachedTransactions.push(cachedTransaction);
    } else {
      hashesToFetch.push(hash);
    }
  });

  if (hashesToFetch.length === 0) {
    return sortTransactionsByTimestamp(cachedTransactions);
  }

  const newTransactions = await getServerTransactionsByHashes(hashesToFetch);

  if (newTransactions.length < hashesToFetch.length) {
    const filteredHashes = hashesToFetch.filter(
      (hash) =>
        !newTransactions.some((transaction) => transaction.txHash === hash)
    );

    // In case the transactions were not found, we create a dummy transaction with the pending status
    // untill all pending transactions are returned from the API
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

  newTransactions.forEach((transaction) => {
    const transactionListItem = mapTransactionToListItem({
      transaction,
      address,
      explorerAddress,
      egldLabel
    });

    if (transactionListItem.status !== TransactionServerStatusesEnum.pending) {
      setInterpretedTransactions({
        transaction: transactionListItem
      });
    }

    cachedTransactions.push(transactionListItem);
  });

  return sortTransactionsByTimestamp(cachedTransactions);
};
