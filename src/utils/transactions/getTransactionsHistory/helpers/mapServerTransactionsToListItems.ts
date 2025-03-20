import { getServerTransactionsByHashes } from 'apiCalls/transactions/getServerTransactionsByHashes';
import { ITransactionListItem } from 'lib/sdkDappCoreUi';
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
  const serverTransactions = await getServerTransactionsByHashes(hashes);

  return serverTransactions.map((transaction) =>
    mapTransactionToListItem({
      transaction,
      address,
      explorerAddress,
      egldLabel
    })
  );
};
