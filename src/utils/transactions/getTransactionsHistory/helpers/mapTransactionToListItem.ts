import { TransactionServerStatusesEnum } from 'types/enums.types';
import { ServerTransactionType } from 'types/serverTransactions.types';
import type { TransactionListItemType } from 'types/transaction-list-item.types';
import { IBaseTransactionParams } from 'types/transaction-list-item.types';
import { getReceiverData } from 'utils/transactions/getTransactionsHistory/helpers/getReceiverData';
import { getTransactionAmount } from './getTransactionAmount';
import { getTransactionAsset } from './getTransactionAsset';
import { processTransactionAction } from './processTransactionAction';
import { processTransactionAssets } from './processTransactionAssets';

interface IMapTransactionToListItemParamsType extends IBaseTransactionParams {
  transaction: ServerTransactionType;
  isPending?: boolean;
  profileImages?: Record<string, string>;
}

export const mapTransactionToListItem = ({
  transaction,
  address,
  egldLabel,
  isPending = false
}: IMapTransactionToListItemParamsType): TransactionListItemType => {
  const { receiver, receiverAssets } = getReceiverData(transaction);
  const isIncomingTransaction = address === receiver;

  const action = processTransactionAction({
    transaction,
    currentUserAddress: address,
    egldLabel,
    isPending
  });

  const transactionAssets = processTransactionAssets({
    userIsReceiver: receiver === address,
    transaction,
    egldLabel
  });

  const transactionListItem: TransactionListItemType = {
    asset: getTransactionAsset({
      ...transaction,
      transactionAssets,
      showDefaultState: isPending,
      status: transaction.status as TransactionServerStatusesEnum
    }),
    details: {
      initiator: isIncomingTransaction ? transaction.sender : receiver,
      initiatorAsset: isIncomingTransaction
        ? transaction.senderAssets?.iconSvg ?? transaction.senderAssets?.iconPng
        : receiverAssets?.iconSvg ?? receiverAssets?.iconPng,
      directionLabel: isIncomingTransaction ? 'From' : 'To'
    },
    action,
    amount: getTransactionAmount({
      transactionAssets,
      isIncomingTransaction
    })
  };

  return transactionListItem;
};
