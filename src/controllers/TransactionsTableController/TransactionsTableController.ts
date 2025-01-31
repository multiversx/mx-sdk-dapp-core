import { useGetAccount } from 'store/selectors/hooks/account/useGetAccount';
import { useGetNetworkConfig } from 'store/selectors/hooks/network/useGetNetworkConfig';
import {
  ServerTransactionType,
  TransactionDirectionEnum
} from 'types/serverTransactions.types';
import { getInterpretedTransaction } from 'utils/transactions/getInterpretedTransaction';
import { getLockedAccountName, getShardText, isContract } from '../../utils';
import { TransactionsTableRowType } from './transactionsTableController.types';

export class TransactionsTableController {
  public static async processTransactions(
    transactions: ServerTransactionType[]
  ): Promise<TransactionsTableRowType[]> {
    const { address } = useGetAccount();
    const { network } = useGetNetworkConfig();

    const interpretedTransactions = transactions.map((transaction) =>
      getInterpretedTransaction({
        address,
        explorerAddress: network.explorerAddress,
        transaction
      })
    );

    const transactionRows = await Promise.all(
      interpretedTransactions.map(async (transaction) => {
        const receiverName = transaction.receiverAssets?.name.replace(
          /\p{Emoji}/gu,
          ''
        );

        const senderName = transaction.senderAssets?.name.replace(
          /\p{Emoji}/gu,
          ''
        );

        const { senderLockedAccount, receiverLockedAccount } =
          await getLockedAccountName({
            receiver: transaction.receiver,
            sender: transaction.sender,
            tokenId: transaction.tokenIdentifier
          });

        const transactionRow: TransactionsTableRowType = {
          age: transaction.transactionDetails.age,
          direction: transaction.transactionDetails.direction,
          method: transaction.transactionDetails.method,
          iconInfo: transaction.transactionDetails.iconInfo,
          link: transaction.links.transactionLink ?? '',
          txHash: transaction.txHash,
          receiver: {
            address: transaction.receiver,
            name: receiverName ?? '',
            description: `${receiverName} (${transaction.receiver})`,
            isContract: isContract(transaction.receiver),
            isTokenLocked: Boolean(receiverLockedAccount),
            link: transaction.links.receiverLink ?? '',
            shard: getShardText(transaction.receiverShard),
            shardLink: transaction.links.receiverLink,
            showLink:
              transaction.transactionDetails.direction !==
              TransactionDirectionEnum.IN
          },
          sender: {
            address: transaction.sender,
            name: senderName ?? '',
            description: `${senderName} (${transaction.sender})`,
            isContract: isContract(transaction.sender),
            isTokenLocked: Boolean(senderLockedAccount),
            link: transaction.links.senderLink ?? '',
            shard: getShardText(transaction.senderShard),
            shardLink: transaction.links.senderShardLink,
            showLink:
              transaction.transactionDetails.direction !==
              TransactionDirectionEnum.OUT
          }
        };

        return transactionRow;
      })
    );

    return transactionRows;
  }
}
