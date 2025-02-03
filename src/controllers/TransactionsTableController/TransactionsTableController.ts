import {
  ServerTransactionType,
  TransactionDirectionEnum
} from 'types/serverTransactions.types';
import { getInterpretedTransaction } from 'utils/transactions/getInterpretedTransaction';
import {
  getLockedAccountName,
  getShardText,
  isContract,
  getTransactionValue
} from 'utils';
import {
  TransactionsTableRowType,
  TransactionValueType
} from './transactionsTableController.types';
import { NftEnumType } from 'types/tokens.types';
import { DECIMALS } from 'lib/sdkDappUtils';
import { FormatAmountController } from '../FormatAmountController';

interface TransactionsTableProcessTransactionsParamsType {
  address: string;
  explorerAddress: string;
  transactions: ServerTransactionType[];
}

export class TransactionsTableController {
  public static async processTransactions({
    address,
    explorerAddress,
    transactions
  }: TransactionsTableProcessTransactionsParamsType): Promise<
    TransactionsTableRowType[]
  > {
    const interpretedTransactions = transactions.map((transaction) =>
      getInterpretedTransaction({
        address,
        explorerAddress,
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

        const { egldValueData, tokenValueData, nftValueData } =
          getTransactionValue({
            transaction
          });

        const hideBadgeForMetaESDT =
          nftValueData?.token.type === NftEnumType.MetaESDT;

        const badge = hideBadgeForMetaESDT
          ? undefined
          : nftValueData?.badgeText;

        const formattedAmount = FormatAmountController.getData({
          input:
            egldValueData?.value ??
            tokenValueData?.value ??
            nftValueData?.value ??
            '',
          decimals:
            egldValueData?.decimals ??
            tokenValueData?.decimals ??
            nftValueData?.decimals ??
            DECIMALS
        });

        const transactionValue: TransactionValueType = {
          badge: badge ?? undefined,
          collection:
            tokenValueData?.token.collection ?? nftValueData?.token.collection,
          link:
            tokenValueData?.tokenExplorerLink ??
            nftValueData?.tokenExplorerLink,
          linkText:
            tokenValueData?.tokenLinkText ?? nftValueData?.tokenLinkText,
          name: tokenValueData?.token.name ?? nftValueData?.token.name,
          showFormattedAmount: Boolean(
            egldValueData ||
              tokenValueData?.tokenFormattedAmount ||
              nftValueData?.tokenFormattedAmount
          ),
          svgUrl: tokenValueData?.token.svgUrl ?? nftValueData?.token.svgUrl,
          ticker: tokenValueData?.token.ticker ?? nftValueData?.token.ticker,
          titleText: tokenValueData?.titleText ?? nftValueData?.titleText,
          valueDecimal: formattedAmount.valueDecimal,
          valueInteger: formattedAmount.valueInteger
        };

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
          },
          value: transactionValue
        };

        return transactionRow;
      })
    );

    return transactionRows;
  }
}
